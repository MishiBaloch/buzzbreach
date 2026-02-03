const { db } = require("../../database/config");
const Corporate = db.collection("corporate");
const VendorSentimentsQuiz = db.collection("vendorSentimentsQuiz");
const User = db.collection("users");
const UserResponses = db.collection("sentimentsQuizResponses");

const createSentimentsQuiz = async (req, res) => {
  try {
    const {
      product,
      question,
      optionType,
      options,
      startDate,
      imageUrls,
      targetAudience,
      endDate,
    } = req.body;

    const corporateId = req.params.corporateId;


    const corporateInfo = await Corporate.document(corporateId);
    if (!corporateInfo) {
      return res.status(404).json({ error: "Corporate not found!" });
    }

    if (startDate >= endDate || endDate < new Date()) {
      return res.status(400).json({
        error: "Invalid date range: The end date cannot be before the start date, or it cannot be set in the past."
      });
    }
    const newSentimentQuiz = {
      product,
      question,
      optionType,
      corporateId,
      options,
      imageUrls,      
      targetAudience,
      startDate,
      endDate,
      displayStatus: "start",
      createdAt: new Date()
    };

    const result = await VendorSentimentsQuiz.save(newSentimentQuiz);
    const sentimentQuiz = await VendorSentimentsQuiz.document(result._key);
    res
      .status(201)
      .json({ message: "Sentiment Quiz created successfully!", data: sentimentQuiz });
  } catch (error) {
    if (error.message == "document not found") {
      return res.status(404).json({ error: "Corporate not found!" });
    }
    res.status(400).json({ error: error.message });
  }
};

const getAllSentimentsQuiz = async (req, res) => {
  try {
    const quizzesCursor = await VendorSentimentsQuiz.all();
    let allQuizzes = await quizzesCursor.all();

    // Sort quizzes by createdAt date in descending order
    allQuizzes = allQuizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const quizzesWithCorporateInfo = await Promise.all(
      allQuizzes.map(async (quiz) => {
        const corporateInfo = await Corporate.document(quiz.corporateId);

        // Fetch the total number of responses for this quiz
        const responsesCursor = await db.query(`
          FOR response IN sentimentsQuizResponses
          FILTER response.quizId == "${quiz._key}"
          COLLECT WITH COUNT INTO totalResponses
          RETURN totalResponses
        `);
        const totalResponses = await responsesCursor.next();

        // Determine the status of the quiz based on today's date
        const today = new Date();
        console.log(today);
        const startDate = new Date(quiz.startDate);
        const endDate = new Date(quiz.endDate);
        endDate.setHours(23, 59, 59, 999);
        let status = "Closed";

        if (quiz.isDrafted == true) {
          status = "draft";
        }
        else if (today < startDate) {
          status = "Pending";
        } else if (today >= startDate && today <= endDate) {
          status = "Active";
        }


        return {
          ...quiz,
          corporateDetails: {
            name: corporateInfo.name,
            logo: corporateInfo.logo,
            pageUri: corporateInfo.pageUri,
            corporateId: quiz.corporateId,
          },
          totalResponses: totalResponses || 0, // Ensure totalResponses is at least 0
          status, // Add the status of the quiz
        };
      })
    );

    res.status(200).json({ data: quizzesWithCorporateInfo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getSentimentsQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await VendorSentimentsQuiz.document(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Sentiment Quiz not found!" });
    }

    const corporateInfo = await Corporate.document(quiz.corporateId);
    if (!corporateInfo) {
      return res.status(404).json({ error: "Corporate not found!" });
    }

    const today = new Date();
    console.log(today);
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    endDate.setHours(23, 59, 59, 999);
    let status = "Closed";

    if (quiz.isDrafted == true) {
      status = "draft";
    }
    else if (today < startDate) {
      status = "Pending";
    } else if (today >= startDate && today <= endDate) {
      status = "Active";
    }


    const quizWithCorporateInfo = {
      ...quiz,
      status,
      corporateDetails: {
        name: corporateInfo.name,
        logo: corporateInfo.logo,
        pageUri: corporateInfo.pageUri,
        corporateId: quiz.corporateId,
      }
    };

    res.status(200).json({ data: quizWithCorporateInfo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSentimentsQuizByCorporate = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;

    // Fetch quizzes for the given corporateId
    const quizzesCursor = await VendorSentimentsQuiz.byExample({ corporateId });
    let corporateQuizzes = await quizzesCursor.all();
    corporateQuizzes = corporateQuizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Fetch corporate information
    const corporateInfo = await Corporate.document(corporateId);
    if (!corporateInfo) {
      return res.status(404).json({ error: "Corporate not found!" });
    }

    // Map over quizzes to include corporate details and response counts
    const quizzesWithDetails = await Promise.all(
      corporateQuizzes.map(async (quiz) => {
        // Fetch the total number of responses for this quiz
        const responsesCursor = await db.query(`
                    FOR response IN sentimentsQuizResponses
                    FILTER response.quizId == "${quiz._key}"
                    COLLECT WITH COUNT INTO totalResponses
                    RETURN totalResponses
                `);
        const totalResponses = await responsesCursor.next();

        const today = new Date();
        console.log(today);
        const startDate = new Date(quiz.startDate);
        const endDate = new Date(quiz.endDate);
        endDate.setHours(23, 59, 59, 999);
        let status = "Closed";

        if (quiz.isDrafted == true) {
          status = "draft";
        }
        else if (today < startDate) {
          status = "Pending";
        } else if (today >= startDate && today <= endDate) {
          status = "Active";
        }

        // Add corporate details and totalResponses to each quiz
        return {
          ...quiz,
          status,
          corporateDetails: {
            name: corporateInfo.name,
            logo: corporateInfo.logo,
            pageUri: corporateInfo.pageUri,
            corporateId,
          },
          totalResponses: totalResponses || 0,  // Ensure totalResponses is at least 0
        };
      })
    );

    res.status(200).json({ data: quizzesWithDetails });
  } catch (error) {
    if (error.message === "document not found") {
      return res.status(404).json({ error: "Corporate not found!" });
    }
    res.status(400).json({ error: error.message });
  }
};


const updateSentimentsQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const updates = req.body;

    const quiz = await VendorSentimentsQuiz.document(quizId);

    if (!quiz) {
      return res.status(404).json({ error: "Sentiment Quiz not found!" });
    }



    const quizStartDate = new Date(quiz.startDate);
    if (new Date() >= quizStartDate) {
      return res.status(400).json({ error: "You can't change the quiz once it has started!" })
    }

    const updatedQuiz = {
      ...quiz,
      ...updates,
      updatedAt: new Date()
    };

    await VendorSentimentsQuiz.update(quizId, updatedQuiz);
    const refreshedQuiz = await VendorSentimentsQuiz.document(quizId);

    res.status(200).json({ message: "Sentiment Quiz updated successfully!", data: refreshedQuiz });
  } catch (error) {
    if (error.message == "document not found") {
      return res.status(404).json({ error: "Sentiment Quiz not found!" });
    }
    res.status(400).json({ error: error.message });
  }
};

const deleteSentimentsQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    const quiz = await VendorSentimentsQuiz.document(quizId);

    await VendorSentimentsQuiz.remove(quizId);

    res.status(200).json({ message: "Sentiment Quiz deleted successfully!" });
  } catch (error) {
    if (error.message == "document not found") {
      return res.status(404).json({ error: "Sentiment Quiz not found!" });
    }
    res.status(400).json({ error: error.message });
  }
};

const getUserSubmittedQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.document(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const cursor = await UserResponses.byExample({ userId });
    const userResponses = await cursor.all();

    if (userResponses.length === 0) {
      return res.status(404).json({ error: "No quizzes found for this user!" });
    }

    const responsesWithDetails = await Promise.all(
      userResponses.map(async (response) => {
        const quiz = await VendorSentimentsQuiz.document(response.quizId);
        return {
          ...response,
          quizDetails: quiz,
          userDetails: user,
        };
      })
    );

    res.status(200).json({ data: responsesWithDetails });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getQuizResponseByUser = async (req, res) => {
  try {
    const { quizId, userId } = req.params;

    const user = await User.document(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const cursor = await UserResponses.byExample({ quizId, userId });
    const response = await cursor.next();

    if (!response) {
      return res.status(404).json({ error: "No response found for this quiz and user!" });
    }

    const quiz = await VendorSentimentsQuiz.document(quizId);
    const responseWithDetails = {
      ...response,
      quizDetails: quiz,
      userDetails: user,
    };

    res.status(200).json({ data: responseWithDetails });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getAllResponsesForQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Fetch the quiz details
    const quiz = await VendorSentimentsQuiz.document(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Sentiment Quiz not found!" });
    }

    // Fetch all user responses for this quiz
    const cursor = await UserResponses.byExample({ quizId });
    const responses = await cursor.all();

    if (responses.length === 0) {
      return res.status(404).json({ error: "No responses found for this quiz!" });
    }

    // Fetch user details for each response and add them to the response data
    const responsesWithDetails = await Promise.all(
      responses.map(async (response) => {
        const user = await User.document(response.userId);
        return {
          ...response,
          quizDetails: quiz,
          userDetails: user,
        };
      })
    );

    res.status(200).json({ data: responsesWithDetails });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const getQuizResponsesSummary = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Fetch the quiz document
    const quiz = await VendorSentimentsQuiz.document(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Fetch all responses related to the quiz
    const responsesCursor = await db.query(`
            FOR response IN sentimentsQuizResponses
            FILTER response.quizId == "${quizId}"
            RETURN response
        `);
    const allResponses = await responsesCursor.all();

    // Calculate total responses
    const totalResponses = allResponses.length;

    // Initialize option percentages with all options set to 0%
    const optionPercentages = quiz.options.reduce((acc, option) => {
      acc[option.option] = 0;
      return acc;
    }, {});

    // Calculate the percentage for each option based on responses
    allResponses.forEach(response => {
      const option = response.answer.option;
      if (optionPercentages[option] !== undefined) {
        optionPercentages[option] += 1;
      }
    });

    // Convert counts to percentages
    for (const option in optionPercentages) {
      if (totalResponses > 0) {
        optionPercentages[option] = (optionPercentages[option] / totalResponses) * 100;
      }
    }

    res.status(200).json({
      totalResponses,
      optionPercentages,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const startSentimentsQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    // Fetch the quiz document
    const quiz = await VendorSentimentsQuiz.document(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found!" });
    }

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    // Check if the quiz is live and not closed
    if (now < startDate || now > endDate) {
      return res.status(400).json({ error: "Quiz is not live!" });
    }

    if (quiz.displayStatus === "closed") {
      return res.status(400).json({ error: "Quiz is already closed!" });
    }


    if (quiz.displayStatus === "start") {
      return res.status(400).json({ error: "Quiz is already started!" });
    }

    // Update the display status to "start"
    await VendorSentimentsQuiz.update(quizId, { displayStatus: "start" });

    res.status(200).json({ message: "Quiz started successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const pauseSentimentsQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    // Fetch the quiz document
    const quiz = await VendorSentimentsQuiz.document(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found!" });
    }

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    // Check if the quiz is live and not closed
    if (now < startDate || now > endDate) {
      return res.status(400).json({ error: "Quiz is not live!" });
    }

    if (quiz.displayStatus === "closed") {
      return res.status(400).json({ error: "Quiz is already closed!" });
    }


    if (quiz.displayStatus === "paused") {
      return res.status(400).json({ error: "Quiz is already paused!" });
    }

    // Update the display status to "paused"
    await VendorSentimentsQuiz.update(quizId, { displayStatus: "paused" });

    res.status(200).json({ message: "Quiz paused successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const closeSentimentsQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    // Fetch the quiz document
    const quiz = await VendorSentimentsQuiz.document(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found!" });
    }

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    // Check if the quiz is live
    if (now < startDate || now > endDate) {
      return res.status(400).json({ error: "Quiz is not live!" });
    }

    // Check if the quiz is already closed
    if (quiz.displayStatus === "closed") {
      return res.status(400).json({ error: "Quiz is already closed!" });
    }

    // Update the display status to "closed"
    await VendorSentimentsQuiz.update(quizId, { displayStatus: "closed" });

    res.status(200).json({ message: "Quiz closed successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createDraftQuiz = async (req, res) => {
  try {
    const {
      product,
      question,
      optionType,
      options,
      startDate,
      endDate,
    } = req.body;

    const corporateId = req.params.corporateId;

    const corporateInfo = await Corporate.document(corporateId);
    if (!corporateInfo) {
      return res.status(404).json({ error: "Corporate not found!" });
    }

    const newDraftQuiz = {
      product,
      question,
      optionType,
      options,
      corporateId,
      startDate,
      endDate,
      isDrafted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await VendorSentimentsQuiz.save(newDraftQuiz);
    const draftQuiz = await VendorSentimentsQuiz.document(result._key);
    res.status(201).json({ message: "Draft quiz created successfully!", data: draftQuiz });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllDraftQuizzes = async (req, res) => {
  try {
    const draftQuizzesCursor = await VendorSentimentsQuiz.byExample({ isDrafted: true });
    const draftQuizzes = await draftQuizzesCursor.all();

    if (draftQuizzes.length === 0) {
      return res.status(404).json({ error: "No draft quizzes found" });
    }

    res.status(200).json({ data: draftQuizzes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getDraftQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;

    const draftQuiz = await VendorSentimentsQuiz.document(quizId);
    if (!draftQuiz || draftQuiz.isDrafted !== true) {
      return res.status(404).json({ error: "Draft quiz not found" });
    }

    res.status(200).json({ data: draftQuiz });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const updateDraftQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const updates = req.body;

    const draftQuiz = await VendorSentimentsQuiz.document(quizId);
    if (!draftQuiz || draftQuiz.isDrafted !== true) {
      return res.status(404).json({ error: "Draft quiz not found" });
    }



    if (updates.startDate >= updates.endDate || updates.endDate < new Date()) {
      return res.status(400).json({
        error: "Invalid date range: The end date cannot be before the start date, or it cannot be set in the past."
      });
    }

    if (!updates.startDate || !updates.endDate) {
      if (updates.startDate && !updates.endDate) {
        if (updates.startDate >= draftQuiz.endDate || draftQuiz.endDate < new Date()) {
          return res.status(400).json({
            error: "Invalid date range: The end date cannot be before the start date, or it cannot be set in the past."
          });
        }
      }
      if (!updates.startDate && updates.endDate) {
        if (draftQuiz.startDate >= updates.endDate || updates.endDate < new Date()) {
          return res.status(400).json({
            error: "Invalid date range: The start date cannot be after the end date."
          });
        }
      }
    }

    // Update the draft quiz
    const updatedQuiz = {
      ...draftQuiz,
      ...updates,
      updatedAt: new Date(),
    };

    await VendorSentimentsQuiz.update(quizId, updatedQuiz);
    res.status(200).json({ message: "Draft quiz updated successfully!", data: updatedQuiz });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteDraftQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    const draftQuiz = await VendorSentimentsQuiz.document(quizId);
    if (!draftQuiz || draftQuiz.isDrafted !== true) {
      return res.status(404).json({ error: "Draft quiz not found" });
    }

    await VendorSentimentsQuiz.remove(quizId);
    res.status(200).json({ message: "Draft quiz deleted successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const moveDraftToQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    // Fetch the draft quiz by ID
    const draftQuiz = await VendorSentimentsQuiz.document(quizId);

    // Check if the quiz exists and is in draft status
    if (!draftQuiz || draftQuiz.isDrafted !== true) {
      return res.status(404).json({ error: "Draft quiz not found or not in draft status" });
    }

    // Check if startDate and endDate are valid
    const today = new Date();
    const startDate = new Date(draftQuiz.startDate);
    const endDate = new Date(draftQuiz.endDate);

    if (startDate > endDate) {
      return res.status(400).json({ error: "Start date cannot be after end date" });
    }
    if (today > endDate) {
      return res.status(400).json({ error: "End date can not be in the past" });
    }
    draftQuiz.isDrafted = false;

    const updatedQuiz = {
      ...draftQuiz,
      displayStatus: "start",
      updatedAt: new Date(),
    };

    await VendorSentimentsQuiz.update(quizId, updatedQuiz);
    res.status(200).json({ message: "Draft quiz moved to active successfully!", data: updatedQuiz });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};








module.exports = {
  createSentimentsQuiz,
  getAllSentimentsQuiz,
  getSentimentsQuizById,
  getSentimentsQuizByCorporate,
  updateSentimentsQuiz,
  deleteSentimentsQuiz,
  getUserSubmittedQuizzes,
  getQuizResponseByUser,
  getAllResponsesForQuiz,
  getQuizResponsesSummary,
  startSentimentsQuiz,
  pauseSentimentsQuiz,
  closeSentimentsQuiz,
  createDraftQuiz,
  getAllDraftQuizzes,
  getDraftQuizById,
  updateDraftQuiz,
  deleteDraftQuiz,
  moveDraftToQuiz
};