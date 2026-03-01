



const Authentication = require("../models/authentication_model");
const User = require("../models/user_model");


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

    if (!req.files || !req.files.document) {
      return res.status(400).json({
        status: false,
        message: "Document image is required"
      });
    }

    if (!req.files.user_image) {
      return res.status(400).json({
        status: false,
        message: "User image is required"
      });
    }

    const authRecord = await Authentication.findOne({ user: userId });
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

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

    // Save file paths
    const documentFilePath = req.files.document[0].path;
    const userImageFilePath = req.files.user_image[0].path;


    authRecord.identity_documents = [
      {
        document_type,
        document_url: documentFilePath,
        status: "Pending",
        submitted_at: new Date()
      }
    ];

    // Save user image
    authRecord.user_image = userImageFilePath;

    authRecord.identity_status = "Pending";

    user.account_status = "Pending";
    await user.save();

    await authRecord.save();

    res.status(200).json({
      status: true,
      message: "Identity document submitted successfully. Waiting for admin approval.",
      document: {
        document_type,
        document_url: documentFilePath,
        user_image: userImageFilePath
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


// Get all pending identity verification requests
exports.getPendingIdentities = async (req, res) => {
  try {
    // Find all authentication records where identity_status is Pending
    const pendingRecords = await Authentication.find({ identity_status: "Pending" });

    if (!pendingRecords.length) {
      return res.status(200).json({
        status: true,
        message: "No pending identity verification requests",
        data: []
      });
    }

    // Optional: Only send relevant fields
    const responseData = pendingRecords.map(record => ({
      userId: record.user,
      identity_status: record.identity_status,
      documents: record.identity_documents.filter(doc => doc.status === "Pending")
    }));

    res.status(200).json({
      status: true,
      message: "Pending identity verification requests retrieved",
      data: responseData
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch pending requests",
      error: error.message
    });
  }
};


exports.approveIdentity = async (req, res) => {
  try {
    const { userId, documentId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

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

    user.account_status = "Verified";
    await user.save();

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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }



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

    user.account_status = "Active";
    await user.save();

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




