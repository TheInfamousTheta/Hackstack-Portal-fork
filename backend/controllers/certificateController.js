const crypto = require('crypto');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const User = require('../models/User');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const generateUniqueCode = async () => {
  const year = new Date().getFullYear();
  let attempts = 0;
  while (attempts < 5) {
    const rand = crypto.randomBytes(5).toString('hex').toUpperCase();
    const code = `HS-${year}-${rand}`;
    const exists = await Certificate.findOne({ certificateCode: code }).select('_id');
    if (!exists) return code;
    attempts += 1;
  }
  return `HS-${year}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
};

exports.getOrIssueCertificate = async (req, res) => {
  const { moduleId } = req.params;
  let targetModuleId = isValidObjectId(moduleId) ? moduleId : null;

  try {
    let moduleDoc = null;
    if (targetModuleId) {
      moduleDoc = await Module.findById(targetModuleId);
    }
    if (!moduleDoc) {
      moduleDoc = await Module.findOne({ slug: moduleId });
    }

    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    targetModuleId = moduleDoc._id;

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      userId: req.user._id,
      moduleId: targetModuleId
    });

    if (existingCert) {
      return res.json({ certificate: existingCert, newlyIssued: false });
    }

    // Calculate total days from curriculum
    const allDayIds = [];
    (moduleDoc.chapters || []).forEach((ch) => {
      (ch.days || []).forEach((day) => {
        if (day?._id) allDayIds.push(day._id.toString());
      });
    });

    const totalDays = allDayIds.length;

    // Edge case: Module with 0 days cannot produce completion certificate
    if (totalDays === 0) {
      return res.status(400).json({
        message: 'Module has no curriculum days to complete.'
      });
    }

    // Check student progress
    const progress = await Progress.findOne({
      userId: req.user._id,
      moduleId: targetModuleId
    });

    if (!progress) {
      return res.status(403).json({
        message: 'No progress recorded for this module.'
      });
    }

    const completedDayIds = new Set((progress.completedDays || []).map((id) => id.toString()));
    const allDaysCompleted = allDayIds.every((id) => completedDayIds.has(id));
    const isEligible = allDaysCompleted || (progress.moduleCompleted && completedDayIds.size >= totalDays);

    if (!isEligible) {
      return res.status(403).json({
        message: 'Module curriculum is not fully completed.'
      });
    }

    // Determine recipient display name with fallbacks
    const userDoc = await User.findById(req.user._id).select('name username email');
    const recipientName =
      userDoc?.name?.trim() ||
      userDoc?.username?.trim() ||
      (userDoc?.email ? userDoc.email.split('@')[0] : '') ||
      'Learner';

    let certificate = null;
    let createAttempts = 0;
    while (createAttempts < 5) {
      try {
        const certificateCode = await generateUniqueCode();
        certificate = await Certificate.create({
          certificateCode,
          userId: req.user._id,
          moduleId: targetModuleId,
          recipientName,
          moduleTitle: moduleDoc.title,
          moduleSlug: moduleDoc.slug,
          week: moduleDoc.week || 1,
          issuedAt: new Date()
        });
        break;
      } catch (err) {
        if (err.code === 11000) {
          // If collision is on { userId, moduleId }, return existing
          const existingCert = await Certificate.findOne({
            userId: req.user._id,
            moduleId: targetModuleId
          });
          if (existingCert) {
            return res.json({ certificate: existingCert, newlyIssued: false });
          }
          // Unique index collision on certificateCode -> retry loop
          createAttempts += 1;
          if (createAttempts >= 5) throw err;
        } else {
          throw err;
        }
      }
    }

    return res.status(201).json({ certificate, newlyIssued: true });
  } catch (error) {
    if (error.code === 11000) {
      // Race condition safety: if created concurrently, return existing
      const existingCert = await Certificate.findOne({
        userId: req.user._id,
        ...(targetModuleId ? { moduleId: targetModuleId } : {})
      });
      if (existingCert) {
        return res.json({ certificate: existingCert, newlyIssued: false });
      }
    }
    return res.status(500).json({
      message: 'Failed to generate completion certificate.',
      error: error.message
    });
  }
};

exports.verifyCertificate = async (req, res) => {
  const { certCode } = req.params;

  try {
    if (!certCode || typeof certCode !== 'string') {
      return res.status(400).json({ message: 'Invalid certificate code.' });
    }

    const certificate = await Certificate.findOne({
      certificateCode: certCode.trim().toUpperCase()
    })
      .select('certificateCode recipientName moduleTitle moduleSlug week issuedAt')
      .lean();

    if (!certificate) {
      return res.status(404).json({
        message: 'Certificate not found. The code may be invalid or unverified.'
      });
    }

    return res.json({
      verified: true,
      certificate
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to verify certificate.',
      error: error.message
    });
  }
};
