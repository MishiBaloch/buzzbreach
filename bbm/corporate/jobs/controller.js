const { errorMonitor } = require("nodemailer/lib/xoauth2");
const { db } = require("../../database/config");
const CorporateJob = db.collection("corporateJob");
const jobApplication = db.collection("jobApplication");
const {
  interviewEmail,
  interviewMessageEmail,
} = require("../../utils/interviewEmail");
const interviewTracker = db.collection("interviewTracker");
const Corporate = db.collection("corporate");
const ApplicationConversation = db.collection("applicationConversation");
const {
  getUserData,
  getCorporateUserData,
  checkAdminSuperAdmin,
  emailService,
} = require("../utility/utilityFunction");
const Templates = db.collection("emailTemplates");

const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      workLocation,
      state,
      city,
      jobType,
      companyName,
      email,
      jobDesc,
      skills,
      qualification,
      experience,
      screeningQues,
      lastDate,
      jobLevel,
      salaryRange,
      currency,
      enableInstantInterview,
      numberOfInterviewRounds,
      interviewTitles,
    } = req.body;
    const id = req.user.sub;
    const corporateId = req.params.corporateId;
    const user = await getUserData(id);
    // check corporate user according to the corporate id provided
    const corporateInfo = await Corporate.document(corporateId);
    const cursor = await db.query(`
      FOR corporate IN corporateUser
      FILTER corporate.corporate == "${corporateId}"
      RETURN corporate
      `);
    const corporateData = await cursor.all();

    const corporateUser = await getCorporateUserData(id);
    let checkAdmin;

    if (corporateData[0].admin !== undefined) {
      checkAdmin = corporateData[0].admin.filter((res) => {
        res.user == user[0]._key;
      });
    }

    if (
      corporateData[0].superAdmin.user == user[0]._key ||
      checkAdmin.length > 0
    ) {
      const newjob = {
        corporate: corporateId,
        jobTitle: jobTitle,
        workLocation: workLocation,
        state: state,
        city: city,
        jobType: jobType,
        // companyName: companyName,
        email: email,
        jobDesc: jobDesc,
        skills: skills,
        qualification: qualification,
        experience: experience,
        screeningQues: screeningQues,
        lastDate: lastDate,
        jobLevel: jobLevel,
        salaryRange: salaryRange,
        enableInstantInterview: enableInstantInterview,
        numberOfInterviewRounds: numberOfInterviewRounds,
        interviewTitles: interviewTitles,
        // logo: corporateInfo.logo,
        user: user[0]._key,
        recruiterCurrency: currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await CorporateJob.save(newjob);

      const savedJob = await CorporateJob.document(result._key);
      return res.status(201).json({ data: savedJob });
    } else {
      return res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const cursor = await db.query(`
      FOR job IN corporateJob
        SORT job.createdAt DESC
        LET corporateDetails = (
          FOR corp IN corporate
            FILTER corp._key == job.corporate
            RETURN { corporateName: corp.name, logo: corp.logo, companyUri: corp.pageUri, corporateId : job.corporate }
        )
        RETURN MERGE(job, { corporate: FIRST(corporateDetails) })
    `);
    const jobs = await cursor.all();

    if (!jobs) {
      return res.status(404).json({ error: "Jobs not added" });
    }

    res.status(200).json({ data: jobs });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllJobsCorporate = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;

    const today = new Date();
    today.setDate(today.getDate() - 15); // minus 15 days

    const modifiedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    const cursor = await db.query(
      `
      FOR job IN corporateJob
      FILTER job.corporate == @corporateId 
      AND job.lastDate >= @modifiedDate  // Include jobs till 15 days after expiration
      SORT job.createdAt DESC
      LET corporateDetails = (
          FOR corp IN corporate
            FILTER corp._key == job.corporate
            SORT corp.createdAt DESC
            RETURN { corporateName: corp.name, logo: corp.logo, companyUri: corp.pageUri, corporateId : job.corporate }
        )
        RETURN MERGE(job, { corporate: FIRST(corporateDetails) })
      `,
      { corporateId, modifiedDate }
    );
    const data = await cursor.all();
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const id = req.params.id;

    const cursor = await db.query(`
      FOR job IN corporateJob
      FILTER job._key == "${id}"
      LET corporateDetails = (
          FOR corp IN corporate
            FILTER corp._key == job.corporate
            RETURN { corporateName: corp.name, logo: corp.logo, companyUri: corp.pageUri, corporateId : job.corporate }
        )
        RETURN MERGE(job, { corporate: FIRST(corporateDetails) })
      `);
    const data = await cursor.all();
    if (data.length < 1) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const id = req.params.jobId;
    const updatedValues = req.body;

    const userId = req.user.sub;
    const corporateId = req.params.corporateId;
    const user = await getUserData(userId);
    const checkAdmin = await checkAdminSuperAdmin({
      id: corporateId,
      user: user,
    });
    if (checkAdmin) {
      updatedValues.updatedAt = new Date();

      const update = await CorporateJob.update(id, updatedValues);

      const updatedJob = await CorporateJob.document(id);

      return res.status(200).json({ data: updatedJob });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const id = req.params.jobId;
    const userId = req.user.sub;
    const corporateId = req.params.corporateId;
    const user = await getUserData(userId);
    const checkAdmin = await checkAdminSuperAdmin({
      id: corporateId,
      user: user,
    });
    if (checkAdmin) {
      const doc = await CorporateJob.remove(id)
        .then((response) => {
          res.status(200).json({ data: "deleted" });
        })
        .catch((err) => {
          return res.status(404).json({ error: "Job not found" });
        });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllJobApplications = async (req, res) => {
  try {
    const corporateId = req.params.id;
    const user = req.user.sub;
    const checkUser = await getUserData(user);
    const checkAdmin = await checkAdminSuperAdmin({
      id: corporateId,
      user: checkUser,
    });
    if (!checkAdmin) {
      return res.status(401).json({ message: "not authorised" });
    }
    const cursor = await db.query(`FOR doc IN ${"jobApplication"}
    FILTER doc.corporate == "${corporateId}"
    SORT doc.createdAt DESC
    RETURN doc`);

    const applications = await cursor.all();

    if (!applications) {
      return res.status(404).json({ error: "application not found" });
    }

    res.status(200).json({ data: applications });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getJobApplicationById = async (req, res) => {
  try {
    const id = req.params.id;

    // Single query to fetch both job application and related corporate info
    const query = `
      LET jobApp = DOCUMENT("jobApplication", @id)
      LET jobInfo = (
        FOR info IN corporateJob 
        FILTER info._key == jobApp.jobId
        LET corporateDetails = (
          FOR corp IN corporate
            FILTER corp._key == info.corporate
            RETURN { corporateName: corp.name, logo: corp.logo, companyUri: corp.pageUri, corporateId : info.corporate }
        )
        RETURN MERGE(info, { corporate: FIRST(corporateDetails) })
      )
      
      RETURN {
        jobApplicationInfo: jobApp ? jobApp : null,
        jobInfo: LENGTH(jobInfo) > 0 ? jobInfo[0] : null,
      }
    `;

    const cursor = await db.query(query, { id });
    const result = await cursor.next();

    if (!result.jobApplicationInfo) {
      return res.status(404).json({ error: "application not found" });
    }
    res.status(200).json({
      data: result,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const numberOfApplicants = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const cursor = await db.query(
      `
      FOR doc IN jobApplication
      FILTER doc.jobId == @jobId
      COLLECT WITH COUNT INTO length
      RETURN length
    `,
      { jobId }
    );

    const count = await cursor.next();
    res.status(200).json({ data: count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const jobApplicantsInfo = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const cursor = await db.query(
      `
      FOR doc IN jobApplication
        FILTER doc.jobId == @jobId
        LET jobInfo = (
          FOR info IN corporateJob 
            FILTER info._key == @jobId
            RETURN { jobTitle: info.jobTitle }
        )[0]
        LET corporateDetails = (
          FOR corp IN corporate
            FILTER corp._key == doc.corporate
            RETURN {
              corporateName: corp.name,
              logo: corp.logo,
              companyUri: corp.pageUri,
              corporateId: doc.corporate
            }
        )[0]
        SORT doc.createdAt DESC
        RETURN MERGE(doc, jobInfo, {corporate:corporateDetails})
    `,
      { jobId }
    );

    const info = await cursor.all();
    res.status(200).json({ data: info });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//old instant interview
const approveOrRejectApplication = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const {
      approved,
      review,
      about,
      skills,
      experience,
      certification,
      overallRating,
      interviewUrl,
    } = req.body;
    const cursorJobApplication = await jobApplication.document(applicationId);
    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });
    if (admin) {
      if (!approved) {
        cursorJobApplication["approved"] = false;
        cursorJobApplication["updatedAt"] = new Date();
        cursorJobApplication["status"] = "rejected";
        cursorJobApplication["review"] = review;
        cursorJobApplication["about"] = about;
        cursorJobApplication["skills"] = skills;
        cursorJobApplication["experience"] = experience;
        cursorJobApplication["certification"] = certification;
        cursorJobApplication["overallRating"] = overallRating;
        const updateJobApplication = await jobApplication.update(
          applicationId,
          cursorJobApplication
        );
        return res.status(200).json({ data: cursorJobApplication });
      } else {
        cursorJobApplication["approved"] = true;
        cursorJobApplication["updatedAt"] = new Date();
        cursorJobApplication["review"] = review;
        cursorJobApplication["status"] = "approved";
        cursorJobApplication["about"] = about;
        cursorJobApplication["skills"] = skills;
        cursorJobApplication["experience"] = experience;
        cursorJobApplication["certification"] = certification;
        cursorJobApplication["overallRating"] = overallRating;
        cursorJobApplication["interviewUrl"] = interviewUrl;
        if (interviewUrl) {
          cursorJobApplication["urlExpiryDateAndTime"] = Date.now();
          cursorJobApplication["linkExpired"] = false;
        }
        const updateJobApplication = await jobApplication.update(
          applicationId,
          cursorJobApplication
        );
        return res.status(200).json({ data: cursorJobApplication });
      }
    }
    return res.status(401).json({ message: "not authorised" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const interviewConversation = async ({ applicationId, status }) => {
  // save conversation
  try {
    // Retrieve the job application document
    const cursorJobApplication = await jobApplication.document(applicationId);
    if (!cursorJobApplication) {
      return "Job application not found";
    }
    let conversationId, response;
    const messageData = {
      sender: "recruiter",
      status: status,
      // message: message, // This should be an array of strings
      timestamp: new Date().getTime(), // Timestamp in milliseconds
    };
    // Retrieve the existing conversation document
    const existingDocument = await ApplicationConversation.document(
      cursorJobApplication.conversationId
    )
      .then(async (response) => {
        if (response) {
          response = response;
          conversationId = cursorJobApplication.conversationId;
          const query = `
          FOR conversation IN applicationConversation
            FILTER conversation._key == @conversationId
            UPDATE conversation WITH { 
              messages: APPEND(conversation.messages, @messageData, true) 
            } IN applicationConversation
            RETURN NEW
        `;
          const bindVars = {
            conversationId: cursorJobApplication.conversationId,
            messageData: messageData,
          };
          const cursor = await db.query(query, bindVars);
          const updatedConversation = await cursor.next();
          console.log("saved");
          return response;
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
    if (!existingDocument && !response) {
      // Create a new document if it doesn't exist
      const conversation = await ApplicationConversation.save({
        applicationId,
        messages: [messageData],
      });
      const updateJob = await jobApplication.update(applicationId, {
        conversationId: conversation._key,
      });
      return;
    }
  } catch (error) {
    return error.message;
  }
};

// Step-1 approved by admin , suggest date
const shortlistAndScheduleInterview = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const {
      approved,
      review,
      about,
      skills,
      experience,
      certification,
      overallRating,
      interviewSlot1,
      interviewSlot2,
      interviewSlot3,
      timeZone,
      interviewUrl,
      basicInterviewMessage,
      rescheduleConfirmMessage,
      invite,
      round,
    } = req.body;

    // Fetch the existing job application document
    const cursorJobApplication = await jobApplication.document(applicationId);
    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }

    // Check if the user has admin or super admin rights
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (approved) {
      const checkRound = round - 1; // Adjust for 0-based indexing

      // Get the existing interview round data if exists, otherwise an empty object
      let existingRoundData =
        cursorJobApplication.interview &&
        cursorJobApplication.interview[checkRound]
          ? cursorJobApplication.interview[checkRound]
          : {};

      // Create a new interview data object with only the provided fields
      const newInterviewData = {
        round: round,
        approved: true,
        updatedAt: new Date(),
        ...(review && { review }),
        ...(about && { about }),
        ...(skills && { skills }),
        ...(experience && { experience }),
        ...(certification && { certification }),
        ...(overallRating && { overallRating }),
        ...(interviewUrl && { interviewUrl }),
        ...(interviewSlot1 && { interviewSlot1 }),
        ...(interviewSlot2 && { interviewSlot2 }),
        ...(interviewSlot3 && { interviewSlot3 }),
        ...(timeZone && { recruiterTimeZone: timeZone }),
        ...(basicInterviewMessage && { basicInterviewMessage }),
        ...(invite && { invite }),
      };

      // Handle rescheduleConfirmMessage only if provided
      if (rescheduleConfirmMessage) {
        newInterviewData.rescheduleConfirmMessage = rescheduleConfirmMessage;
      }

      // Determine the status based on invite
      newInterviewData.status =
        invite === "reschedule confirmed"
          ? "reschedule confirmed"
          : "shortlisted";

      // Merge the existing interview data with the new data (preserve old fields)
      const mergedInterviewData = { ...existingRoundData, ...newInterviewData };
      const jobInfo = await CorporateJob.document(cursorJobApplication.jobId);

      // Update the interview array with the merged data
      cursorJobApplication.interview = cursorJobApplication.interview || [];
      cursorJobApplication.interview[checkRound] = mergedInterviewData;
      if (invite == "shortlisted") {
        cursorJobApplication.status = "round " + round + " " + "shortlisted";
        await jobApplication.update(applicationId, {
          status: cursorJobApplication.status,
        });
      }
      // Trigger interview conversation based on the invite and interviewSlot1 status
      if (invite === "reschedule confirmed") {
        interviewConversation({
          applicationId: applicationId,
          status: "round " + round + " " + invite,
        });
      } else if (interviewSlot1) {
        interviewConversation({
          applicationId: applicationId,
          status: cursorJobApplication.availableForInstantInterview
            ? "round " + round + " instant interview requested"
            : "round " + round + " interview requested",
        });
      } else {
        if (
          cursorJobApplication.availableForInstantInterview &&
          jobInfo.enableInstantInterview
        ) {
          shortlistStatus = "round " + round + " " + "shortlisted";
        } else {
          shortlistStatus = "shortlisted";
        }
        interviewConversation({
          applicationId: applicationId,
          status: shortlistStatus,
        });
      }

      // Update only the interview field in the database to prevent full object replacement
      await jobApplication.update(applicationId, {
        interview: cursorJobApplication.interview,
      });

      // Fetch and return the updated document
      const updatedJobApplication = await jobApplication.document(
        applicationId
      );
      return res.status(200).json({ data: updatedJobApplication });
    }

    return res
      .status(400)
      .json({ message: "Job application was not approved" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const interviewConfirmation = async (req, res) => {
  try {
    const { interviewUrl, interviewInstructions, round } = req.body;
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const cursorJobApplication = await jobApplication.document(applicationId);
    // Get the existing interview round data if exists, otherwise an empty object
    const interviewIndex = cursorJobApplication.interview.findIndex(
      (interviewRound) => interviewRound.round === round
    );

    if (interviewIndex === -1) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    // Existing interview round data
    const existingInterviewData =
      cursorJobApplication.interview[interviewIndex];

    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });
    if (admin) {
      existingInterviewData.interviewUrl = interviewUrl;
      existingInterviewData.interviewInstructions = interviewInstructions;
      existingInterviewData.invite = "interview scheduled";
      existingInterviewData.updatedAt = new Date();
      cursorJobApplication.unlocked = "false";
      const updateJobApplication = await jobApplication.update(
        applicationId,
        cursorJobApplication
      );

      const doc = await jobApplication.document(applicationId);
      interviewConversation({
        applicationId: applicationId,
        status: "round " + round + " interview scheduled",
      });
      // interviewEmail({email: "mudita.joshi@s3bglobal.com", applicationId: "123", interviewInstructions: "Please review the following details and confirm your availability for the interview. Click the button below to schedule and attend the interview at your convenience. If you encounter any issues please reach out to us."})

      // Interview Notification
      const checkForTemplateCursor = await Templates.byExample({
        name: "Interview Notification",
      });

      const template = await checkForTemplateCursor.all();
      if (template[0]) {
        const payload = {
          users: user,
          jobApplication: cursorJobApplication,
          interview: existingInterviewData,
        };
        emailService({
          payload: payload,
          recipient: cursorJobApplication.email,
          templateName: "Interview Notification",
        });
      } else {
        interviewEmail({
          email: cursorJobApplication.email,
          applicationId,
          interviewInstructions,
        });
      }

      return res.status(200).json({ data: doc });
    }
    return res.status(401).json({ message: "not authorised" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const closeJobApplication = async (req, res) => {
  try {
    const { companyClosureMessage, recruiterExternallyProcessed, round } =
      req.body;
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const cursorJobApplication = await jobApplication.document(applicationId);
    const interviewIndex = cursorJobApplication.interview.findIndex(
      (interviewRound) => interviewRound.round === round
    );

    if (interviewIndex === -1) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    // Existing interview round data
    const existingInterviewData =
      cursorJobApplication.interview[interviewIndex];

    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });
    if (admin) {
      existingInterviewData.companyClosureMessage = companyClosureMessage;
      existingInterviewData.updatedAt = new Date();
      existingInterviewData.status = "closed";
      existingInterviewData.invite = "closed";
      cursorJobApplication.status = "closed";
      existingInterviewData.recruiterExternallyProcessed =
        recruiterExternallyProcessed;

      const updateJobApplication = await jobApplication.update(
        applicationId,
        cursorJobApplication
      );
      const doc = await jobApplication.document(applicationId);
      interviewConversation({
        applicationId: applicationId,
        status: "closed",
      });
      const jobInfo = await CorporateJob.document(doc.jobId);
      const corporateInfo = await Corporate.document(doc.corporate);
      interviewTracking({
        applicationId,
        applicationInfo: doc,
        jobInfo,
        corporateInfo,
      });
      return res.status(200).json({ data: doc });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateViewedStatus = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;

    let round = 1;
    const cursorJobApplication = await jobApplication.document(applicationId);
    cursorJobApplication.interview = cursorJobApplication.interview || [
      { round },
    ];
    const interviewIndex = cursorJobApplication.interview.findIndex(
      (interviewRound) => interviewRound.round === round
    );

    if (cursorJobApplication.status === "viewed") {
      return res.status(409).json({ message: "Already viewed" });
    }

    // Existing interview round data
    const existingInterviewData =
      cursorJobApplication.interview[interviewIndex];
    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });
    if (admin && cursorJobApplication.status == "pending") {
      existingInterviewData.invite = "viewed";
      existingInterviewData.status = "viewed";
      cursorJobApplication.status = "viewed";
      cursorJobApplication.updatedAt = new Date();
      const updateJobApplication = await jobApplication.update(
        applicationId,
        cursorJobApplication
      );
      const doc = await jobApplication.document(applicationId);
      interviewConversation({
        applicationId: applicationId,
        status: "viewed",
      });
      return res.status(200).json({ data: doc });
    } else {
      return res.status(409).json({ message: "already viewed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const interviewTracking = async ({
  applicationId,
  applicationInfo,
  jobInfo,
  corporateInfo,
}) => {
  // console.log(applicationId, applicationInfo, jobInfo, corporateInfo);
  const cursor = await db.query(
    `
    FOR application IN interviewTracker
    FILTER application.applicationInfo._key == @applicationKey
    RETURN application
  `,
    { applicationKey: applicationId }
  );
  const application = await cursor.next();
  // console.log(application);
  let track;
  if (application) {
    track = await interviewTracker.update(application._key, {
      applicationInfo,
      jobInfo,
      corporateInfo,
    });
  } else {
    track = await interviewTracker.save({
      applicationInfo,
      jobInfo,
      corporateInfo,
    });
  }
  return track;
};

const checkExpiry = async () => {
  try {
    const currentTimestamp = Date.now(); // Current timestamp in milliseconds

    const query = `
      FOR doc IN jobApplication
      FILTER doc.linkExpired == false 
      AND DATE_DIFF(doc.urlExpiryDateAndTime, DATE_NOW(), "minutes") > 10
      UPDATE doc WITH { linkExpired: true } IN jobApplication
      RETURN NEW`;

    const cursor = await db.query(query);
    const updatedDocs = await cursor.all();

    console.log(`Updated ${updatedDocs.length} documents to expired.`);
  } catch (error) {
    console.log(error.message);
  }
};

const updateInterviewFeedback = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const { round } = req.body;
    const {
      // priorEducation,
      // priorWorkExperience,
      // strengths,
      // aspirations,
      // disagreements,
      // motivation,
      // prioritization,
      // pastMistake,
      // company,
      // overallImpression,
      invite,
      interviewFeedbackMessage,
      finalSelected,
      communicationSkills,
      confidence,
      professionalism,
      problemSolvingSkills,
      adaptability,
      teamwork,
      leadership,
      enthusiasm,
      culturalFit,
      technicalSkills,
      listeningSkills,
      timeManagement,
      creativity,
      integrity,
      workEthic,
      emotionalIntelligence,
      attentionToDetail,
      initiative,
      resilience,
      interpersonalSkills,
    } = req.body;
    const cursorJobApplication = await jobApplication.document(applicationId);
    const interviewIndex = cursorJobApplication.interview.findIndex(
      (interviewRound) => interviewRound.round === round
    );

    if (interviewIndex === -1) {
      return res.status(404).json({ message: "Interview round not found" });
    }
    // Existing interview round data
    const existingInterviewData =
      cursorJobApplication.interview[interviewIndex];

    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });
    if (admin) {
      const feedback = {
        communicationSkills,
        confidence,
        professionalism,
        problemSolvingSkills,
        adaptability,
        teamwork,
        leadership,
        enthusiasm,
        culturalFit,
        technicalSkills,
        listeningSkills,
        timeManagement,
        creativity,
        integrity,
        workEthic,
        emotionalIntelligence,
        attentionToDetail,
        initiative,
        resilience,
        interpersonalSkills,
      };
      existingInterviewData.interviewFeedback = feedback;

      if (finalSelected === true) {
        cursorJobApplication.status = invite;
        existingInterviewData.status = invite;
      } else {
        cursorJobApplication.status = "round " + round + " " + invite;
        existingInterviewData.status = invite;
      }

      existingInterviewData.interviewFeedbackMessage = interviewFeedbackMessage;
      cursorJobApplication.updatedAt = new Date();
      cursorJobApplication.unlocked = "true";
      const updateJobApplication = await jobApplication.update(
        applicationId,
        cursorJobApplication
      );
      const doc = await jobApplication.document(applicationId);

      const updatedStatus =
        finalSelected === true ? invite : "round " + round + " " + invite;

      await interviewConversation({
        applicationId: applicationId,
        status: updatedStatus,
      });

      // Save interview tracker

      // await interviewTracker.save({
      //   interviewFeedbackMessage,
      //   interviewFeedback: feedback,
      //   status: invite,
      //   updatedAt: new Date(),
      // });
      return res.status(200).json({ data: doc });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendMessageNotification = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const { message, round } = req.body;
    const cursorJobApplication = await jobApplication.document(applicationId);

    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }
    cursorJobApplication.interview[round - 1].newInterviewMessage = message;
    const updateJobApplication = await jobApplication.update(
      applicationId,
      cursorJobApplication
    );
    const jobInfo = await CorporateJob.document(cursorJobApplication.jobId);
    const corporateData = await Corporate.document(corporateId);

    // Recruiter Message Notification
    const checkForTemplateCursor = await Templates.byExample({
      name: "Recruiter Message Notification",
    });

    const template = await checkForTemplateCursor.all();
    if (template[0]) {
      const payload = {
        corporate: corporateData,
        corporateJob: jobInfo,
        jobApplication: cursorJobApplication,
      };

      emailService({
        payload: payload,
        recipient: cursorJobApplication.email,
        templateName: "Recruiter Message Notification",
      });
    } else {
      interviewMessageEmail({
        email: cursorJobApplication.email,
        companyName: corporateData.name,
        name: cursorJobApplication.name,
        jobTitle: jobInfo.jobTitle,
        message: message,
      });
    }

    const doc = await jobApplication.document(applicationId);
    return res.status(200).json({ data: doc });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const applicationRejected = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const corporateId = req.params.corporateId;
    const {
      approved,
      about,
      skills,
      certification,
      overallRating,
      invite,
      round,
      experience,
      review,
    } = req.body;

    // Fetch the existing job application document
    const cursorJobApplication = await jobApplication.document(applicationId);
    if (!cursorJobApplication) {
      return res.status(404).json({ message: "Job application not found" });
    }

    // Check if the user has admin or super admin rights
    const user = await getUserData(req.user.sub);
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!approved) {
      const checkRound = round - 1; // Adjust for 0-based indexing

      // Get the existing interview round data if exists, otherwise an empty object
      let existingRoundData =
        cursorJobApplication.interview &&
        cursorJobApplication.interview[checkRound]
          ? cursorJobApplication.interview[checkRound]
          : {};

      // Create a new interview data object with only the provided fields
      const newInterviewData = {
        round: round,
        approved: approved,
        updatedAt: new Date(),
        ...(about && { about }),
        ...(skills && { skills }),
        ...(certification && { certification }),
        ...(overallRating && { overallRating }),
        ...(experience && { experience }),
        ...(review && { review }),
        ...(invite && { invite }),
      };

      // Determine the status based on invite
      newInterviewData.status = "rejected";
      newInterviewData.invite = "rejected";
      cursorJobApplication.status = "rejected";

      // Merge the existing interview data with the new data (preserve old fields)
      const mergedInterviewData = { ...existingRoundData, ...newInterviewData };
      const jobInfo = await CorporateJob.document(cursorJobApplication.jobId);

      // Update the interview array with the merged data
      cursorJobApplication.interview = cursorJobApplication.interview || [];
      cursorJobApplication.interview[checkRound] = mergedInterviewData;

      // Trigger interview conversation based on the invite and interviewSlot1 status

      interviewConversation({
        applicationId: applicationId,
        status: invite,
      });

      // Update only the interview field in the database to prevent full object replacement
      await jobApplication.update(applicationId, cursorJobApplication);

      // Fetch and return the updated document
      const updatedJobApplication = await jobApplication.document(
        applicationId
      );
      console.log(updatedJobApplication);
      return res.status(200).json({ data: updatedJobApplication });
    }

    return res.status(400).json({ message: "Job application was approved" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Run the checkExpiry function periodically
// setInterval(checkExpiry, 120000); // Run every 2 minutes (120,000 milliseconds)

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobApplications,
  getAllJobsCorporate,
  getJobApplicationById,
  numberOfApplicants,
  approveOrRejectApplication,
  jobApplicantsInfo,
  shortlistAndScheduleInterview,
  interviewConfirmation,
  closeJobApplication,
  updateViewedStatus,
  updateInterviewFeedback,
  sendMessageNotification,
  applicationRejected,
};
