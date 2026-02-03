const { db } = require("../../database/config");
const axios = require("axios");
const {
  getCorporateUserData,
  checkAdminSuperAdmin,
  getUserData,
} = require("../utility/utilityFunction");
const ColleagueRating = db.collection("colleagueRating");

const createRating = async (req, res) => {
  try {
    const {
      overAllRating,
      leadershipSkills,
      communication,
      teamwork,
      problemSolving,
      interPersonalRelationship,
      comment,
      user,
      firstName,
      lastName,
      userName,
      email,
      profileImg,
    } = req.body;
    const corporateId = req.params.corporateId;

    // Fetching reviewer's user data
    const reviewerInfo = await getUserData(req.user.sub);
    if (!reviewerInfo || reviewerInfo.length === 0) {
      return res.status(400).json({ message: "Reviewer not found." });
    }

    // Prevent users from rating themselves
    if (reviewerInfo[0]._key === user) {
      return res.status(400).json({ message: "Users cannot rate themselves." });
    }

    // Fetching reviewer profile
    const reviewerProfileCursor = await db.query(
      `
      FOR profile IN profile
      FILTER profile.user == @reviewerUserId
      RETURN profile
    `,
      { reviewerUserId: reviewerInfo[0]._key }
    );
    const reviewerProfile = await reviewerProfileCursor.all();
    if (
      !reviewerProfile[0]?.workExperience ||
      reviewerProfile[0].workExperience.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Reviewer has no work experience." });
    }

    // Fetching rated user's profile
    const ratedUserProfileCursor = await db.query(
      `
      FOR profile IN profile
      FILTER profile.user == @ratedUserId
      RETURN profile
    `,
      { ratedUserId: user }
    );
    const ratedUserProfile = await ratedUserProfileCursor.all();
    if (
      !ratedUserProfile[0]?.workExperience ||
      ratedUserProfile[0].workExperience.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Rated user has no work experience." });
    }

    // Utility functions for date parsing and overlap checking
    const parseDate = (dateStr) => {
      if (!dateStr || dateStr.toLowerCase() === "ongoing") {
        return Date.now(); // Ongoing is treated as current date
      }
      const date = new Date(dateStr);
      return isNaN(date) ? null : date.getTime();
    };

    const hasOverlap = (exp1, exp2) => {
      const start1 = parseDate(exp1.startDate);
      const end1 = parseDate(exp1.endDate);
      const start2 = parseDate(exp2.startDate);
      const end2 = parseDate(exp2.endDate);
      return (
        start1 <= end2 &&
        start2 <= end1 &&
        exp1.employer?.toLowerCase() === exp2.employer?.toLowerCase()
      );
    };

    // Check for overlapping work experience
    let overlappingExperienceCount = 0;
    reviewerProfile[0].workExperience.forEach((re) => {
      ratedUserProfile[0].workExperience.forEach((ue) => {
        if (hasOverlap(re, ue)) {
          overlappingExperienceCount++;
        }
      });
    });

    if (overlappingExperienceCount === 0) {
      return res
        .status(400)
        .json({ message: "No overlapping work experience found." });
    }

    // Check for existing rating
    const existingRatingCursor = await db.query(
      `
      FOR rating IN colleagueRating
      FILTER rating.ratedUser.user == @ratedUserId AND rating.reviewer.user == @reviewerUserId
      RETURN rating
    `,
      { reviewerUserId: reviewerInfo[0]._key, ratedUserId: user }
    );
    const existingRating = await existingRatingCursor.all();
    if (existingRating.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already rated this user." });
    }

    // Save the rating
    const savedRating = await ColleagueRating.save({
      ratedUser: { user, firstName, lastName, userName, email, profileImg },
      reviewer: {
        user: reviewerInfo[0]._key,
        firstName: reviewerInfo[0].firstName,
        lastName: reviewerInfo[0].lastName,
        userName: reviewerInfo[0].userName,
        email: reviewerInfo[0].email,
        profileImg: reviewerInfo[0].profileImg,
      },
      overAllRating,
      leadershipSkills,
      communication,
      teamwork,
      problemSolving,
      interPersonalRelationship,
      comment,
      approved: true,
      corporate: corporateId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res
      .status(200)
      .json({ message: "Colleague rated successfully.", rating: savedRating });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllRatings = async (req, res) => {
  try {
    const corporateId = req.params.id;

    const cursor = await db.query(`FOR doc IN colleagueRating
    FILTER doc.corporate == "${corporateId}"
    SORT doc.createdAt DESC
    RETURN doc`);

    const ratings = await cursor.all();

    if (!ratings) {
      return res.status(404).json({ error: "ratings not found" });
    }

    res.status(200).json({ data: ratings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllRatingsByUser = async (req, res) => {
  try {
    const user = req.user.sub;
    const info = await getUserData(user);

    const cursor = await db.query(`FOR doc IN colleagueRating
    FILTER doc.reviewer.user == "${info[0]._key}"
    SORT doc.createdAt DESC
    RETURN doc`);

    const ratings = await cursor.all();

    if (!ratings) {
      return res.status(404).json({ error: "ratings not found" });
    }

    res.status(200).json({ data: ratings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAvgRatingsForUser = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;
    const cursor = await db.query(
      `
      FOR doc IN colleagueRating
      FILTER doc.corporate == @corporateId
      COLLECT ratedUser = doc.ratedUser.user,
              firstName = doc.ratedUser.firstName,
              lastName = doc.ratedUser.lastName ,
              email = doc.ratedUser.email,
              userName = doc.ratedUser.userName,
              profileImg = doc.ratedUser.profileImg INTO group
      
      RETURN {
        user: ratedUser,
        overAllRating: AVERAGE(group[*].doc.overAllRating),
        leadershipSkills: AVERAGE(group[*].doc.leadershipSkills),
        communication: AVERAGE(group[*].doc.communication),
        teamwork: AVERAGE(group[*].doc.teamwork),
        problemSolving: AVERAGE(group[*].doc.problemSolving),
        interPersonalRelationship: AVERAGE(group[*].doc.interPersonalRelationship),
        firstName : firstName,
        lastName: lastName,
        userName: userName,
        email: email,
        profileImg: profileImg
      }
    `,
      { corporateId }
    );

    const avgRatings = await cursor.all();

    res.status(200).json({ data: avgRatings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const viewProfileRating = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userRating = await db.query(
      `
     FOR doc IN colleagueRating
      FILTER doc.ratedUser.user == @userId
      COLLECT ratedUser = doc.ratedUser.user,
              firstName = doc.ratedUser.firstName,
              lastName = doc.ratedUser.lastName ,
              email = doc.ratedUser.email,
              userName = doc.ratedUser.userName,
              profileImg = doc.ratedUser.profileImg INTO group
      
      RETURN {
        user: ratedUser,
        overAllRating: AVERAGE(group[*].doc.overAllRating),
        leadershipSkills: AVERAGE(group[*].doc.leadershipSkills),
        communication: AVERAGE(group[*].doc.communication),
        teamwork: AVERAGE(group[*].doc.teamwork),
        problemSolving: AVERAGE(group[*].doc.problemSolving),
        interPersonalRelationship: AVERAGE(group[*].doc.interPersonalRelationship),
        firstName : firstName,
        lastName: lastName,
        userName: userName,
        email: email,
        profileImg: profileImg
      }

      `,
      { userId }
    );

    const avgRatings = await userRating.all();
    if (avgRatings.length === 0 || avgRatings === undefined) {
      return res.status(404).json({ message: "no ratings found" });
    }
    res.status(200).json({ data: avgRatings[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createRating,
  getAllRatings,
  getAllRatingsByUser,
  getAvgRatingsForUser,
  viewProfileRating,
};
