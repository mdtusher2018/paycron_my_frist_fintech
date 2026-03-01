



const Authentication = require("../models/authentication_model");


exports.submitIdentityVerification = async (req, res) => {
  console.log(req.user);
    try {

    const userId = req.user.id;
    const { document_type } = req.body;

    if (!document_type) {
      return res.status(400).json({
        status: false,
        message: "Document type is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Document image is required"
      });
    }

    const authRecord = await Authentication.findOne({ user: userId });

    if (!authRecord) {
      return res.status(404).json({
        status: false,
        message: "Authentication record not found"
      });
    }

    if (authRecord.identity_status === "Approved") {
      return res.status(400).json({
        status: false,
        message: "Identity already verified"
      });
    }

    // Save relative file path
    const filePath = req.file.path;

    authRecord.identity_documents.push({
      document_type,
      document_url: filePath,
      status: "Pending"
    });

    authRecord.identity_status = "Pending";

    await authRecord.save();

    res.status(200).json({
      status: true,
      message: "Identity document submitted successfully. Waiting for admin approval.",
      document: {
        document_type,
        document_url: filePath
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Failed to submit identity verification",
      error: error.message
    });
  }
};


exports.approveIdentity = async (req, res) => {
  try {
    const { userId, documentId } = req.params;

    const authRecord = await Authentication.findOne({ user: userId });

    if (!authRecord) {
      return res.status(404).json({
        status: false,
        message: "Authentication record not found"
      });
    }

    const document = authRecord.identity_documents.id(documentId);

    if (!document) {
      return res.status(404).json({
        status: false,
        message: "Document not found"
      });
    }

    document.status = "Approved";
    document.reviewed_at = new Date();
    document.rejection_reason = null;

    // If at least one document approved → overall approved
    authRecord.identity_status = "Approved";

    await authRecord.save();

    res.status(200).json({
      status: true,
      message: "Identity verification approved"
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Approval failed",
      error: error.message
    });
  }
};


exports.rejectIdentity = async (req, res) => {
  try {
    const { userId, documentId } = req.params;
    const { reason } = req.body;

    const authRecord = await Authentication.findOne({ user: userId });

    if (!authRecord) {
      return res.status(404).json({
        status: false,
        message: "Authentication record not found"
      });
    }

    const document = authRecord.identity_documents.id(documentId);

    if (!document) {
      return res.status(404).json({
        status: false,
        message: "Document not found"
      });
    }

    document.status = "Rejected";
    document.rejection_reason = reason || "Document rejected";
    document.reviewed_at = new Date();

    // Check if all documents are rejected
    const allRejected = authRecord.identity_documents.every(
      doc => doc.status === "Rejected"
    );

    if (allRejected) {
      authRecord.identity_status = "Rejected";
    }

    await authRecord.save();

    res.status(200).json({
      status: true,
      message: "Identity verification rejected"
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Rejection failed",
      error: error.message
    });
  }
};




