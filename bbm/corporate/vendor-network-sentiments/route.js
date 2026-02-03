const express = require("express");
const router = express.Router();

const { createSentimentsQuiz, getAllSentimentsQuiz, getSentimentsQuizByCorporate, getSentimentsQuizById, updateSentimentsQuiz, deleteSentimentsQuiz, getUserSubmittedQuizzes, getQuizResponseByUser, getAllResponsesForQuiz, getQuizResponsesSummary, startSentimentsQuiz, pauseSentimentsQuiz, closeSentimentsQuiz, createDraftQuiz, getAllDraftQuizzes, getDraftQuizById, updateDraftQuiz, deleteDraftQuiz, moveDraftToQuiz } = require("./controller");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.route("/create-sentiment-quiz/:corporateId").post(authMiddleware, createSentimentsQuiz);
router.route("/get-all-sentiments-quizes").get(authMiddleware, getAllSentimentsQuiz);
router.route("/get-sentiment-quiz-by-id/:id").get(authMiddleware, getSentimentsQuizById);
router.route("/update-sentiment-quiz/:id").put(authMiddleware, updateSentimentsQuiz);
router.route("/delete-sentiment-quiz/:id").delete(authMiddleware, deleteSentimentsQuiz);
router.route("/get-all-sentiments-quizes-by-corporate/:corporateId").get(authMiddleware, getSentimentsQuizByCorporate);
router.route("/user/:userId/quizzes").get(authMiddleware, getUserSubmittedQuizzes);
router.route("/quiz/:quizId/user/:userId").get(authMiddleware, getQuizResponseByUser);
router.route("/quiz/:quizId/responses").get(authMiddleware, getAllResponsesForQuiz);
router.route("/quiz/:quizId/summary").get(authMiddleware, getQuizResponsesSummary);
router.route("/quiz/start/:quizId").put(authMiddleware, startSentimentsQuiz);
router.route("/quiz/pause/:quizId").put(authMiddleware, pauseSentimentsQuiz);
router.route("/quiz/close/:quizId").put(authMiddleware, closeSentimentsQuiz);
router.route("/save-draft-quiz/:corporateId").post(authMiddleware, createDraftQuiz);
router.route("/get-all-draft-quizes").get(authMiddleware, getAllDraftQuizzes);
router.route("/get-draft-quiz-by-id/:id").get(authMiddleware, getDraftQuizById);
router.route("/update-draft-quiz/:id").put(authMiddleware, updateDraftQuiz);
router.route("/delete-draft-quiz/:id").delete(authMiddleware, deleteDraftQuiz);
router.route("/undraft-quiz/:id").put(authMiddleware, moveDraftToQuiz);












module.exports = router;
