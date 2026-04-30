// services/diagnose.service.js
// Orchestrates: image upload → AI diagnosis → Firebase save
const { admin, db } = require("../../confi/firebase");
const { diagnoseCropDisease } = require("./ai.service");

/**
 * Creates a new diagnosis:
 * 1. Upload the image to Firebase Storage
 * 2. Run Claude Vision AI diagnosis
 * 3. Save the result to Firestore under /diagnoses/{userId}/{diagnosisId}
 *
 * @param {string} userId        - Authenticated user ID
 * @param {Buffer} imageBuffer   - Raw image bytes
 * @param {string} mimeType      - MIME type (e.g. "image/jpeg")
 * @param {string} originalName  - Original filename
 * @param {string} cropType      - Crop type from request body
 * @returns {Promise<object>}    - Saved diagnosis document
 */
async function createDiagnosis(userId, imageBuffer, mimeType, originalName, cropType) {
  // 1. Upload image to Firebase Storage
  const imageUrl = await uploadImageToStorage(userId, imageBuffer, mimeType, originalName);

  // 2. Run AI diagnosis
  const aiResult = await diagnoseCropDisease(imageBuffer, mimeType, cropType);

  // 3. Build and save diagnosis document
  const diagnosisData = {
    ...aiResult,
    imageUrl,
    userId,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db
    .collection("diagnoses")
    .doc(userId)
    .collection("records")
    .add(diagnosisData);

  return { diagnosisId: docRef.id, ...diagnosisData };
}

/**
 * Retrieves all diagnoses for a user, ordered by creation time (newest first).
 */
async function getDiagnosisHistory(userId) {
  const snapshot = await db
    .collection("diagnoses")
    .doc(userId)
    .collection("records")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ diagnosisId: doc.id, ...doc.data() }));
}

/**
 * Retrieves a single diagnosis by ID for the given user.
 */
async function getDiagnosisById(userId, diagnosisId) {
  const doc = await db
    .collection("diagnoses")
    .doc(userId)
    .collection("records")
    .doc(diagnosisId)
    .get();

  if (!doc.exists) {
    return null;
  }
  return { diagnosisId: doc.id, ...doc.data() };
}

/**
 * Deletes a diagnosis and its associated image from Firebase Storage.
 */
async function deleteDiagnosis(userId, diagnosisId) {
  const docRef = db
    .collection("diagnoses")
    .doc(userId)
    .collection("records")
    .doc(diagnosisId);

  const doc = await docRef.get();
  if (!doc.exists) {
    return false;
  }

  const { imageUrl } = doc.data();

  // Delete Firestore document
  await docRef.delete();

  // Attempt to delete the image from Storage (non-fatal if it fails)
  if (imageUrl) {
    try {
      await deleteImageFromStorage(imageUrl);
    } catch (_err) {
      // Image deletion failure should not fail the request
    }
  }

  return true;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function uploadImageToStorage(userId, buffer, mimeType, originalName) {
  const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
  const ext = originalName.split(".").pop() || "jpg";
  const filename = `diagnoses/${userId}/${Date.now()}.${ext}`;
  const file = bucket.file(filename);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
  });

  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

async function deleteImageFromStorage(imageUrl) {
  // Extract the path from the public URL
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  if (!imageUrl.startsWith(prefix)) return;

  const filePath = imageUrl.slice(prefix.length);
  const bucket = admin.storage().bucket(bucketName);
  await bucket.file(filePath).delete();
}

module.exports = {
  createDiagnosis,
  getDiagnosisHistory,
  getDiagnosisById,
  deleteDiagnosis,
};
