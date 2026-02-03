const { db } = require("../../database/config");
const { getUserData } = require("../utility/utilityFunction");
const CorporateSubscriptionPlans = db.collection("corporateSubscriptionPlans");
const SubscriptionPlans = db.collection("subscriptionPlans");

const selectSubscriptionPlan = async (req, res) => {
  try {
    const keycloackId = req.user.sub;
    const { corporateId, subscriptionPlanId } = req.params;

    const user = await getUserData(keycloackId);
    const userId = user[0]._key;

    const plan = await SubscriptionPlans.document(subscriptionPlanId).catch(
      () => null
    );
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const createdSubscription = await CorporateSubscriptionPlans.save({
      corporateId: corporateId,
      subscriptionPlan: plan,
      userId: userId,
      subscriptionMode: "Online",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Subscription plan selected successfully",
    });
  } catch (error) {
    console.error("Error selecting subscription plan:", error);
    res.status(400).json({ error: error.message });
  }
};

const getSelectedSubscriptionPlan = async (req, res) => {
  try {
    const { corporateId } = req.params;

    const cursor = await db.query(
      `
        FOR plan IN corporateSubscriptionPlans
        FILTER plan.corporateId == @corporateId
        SORT plan.createdAt DESC

        LET requestDetails = (
          plan.subscriptionRequestId ? 
            FIRST(
              FOR req IN subscriptionRequest
                FILTER req._key == plan.subscriptionRequestId
                RETURN req
            ) : null
        )

        RETURN MERGE(plan, {
          subscriptionPlan: requestDetails != null ? requestDetails : plan.subscriptionPlan
        })
      `,
      {
        corporateId
      }
    );

    const selectedPlans = await cursor.next();

    if (!selectedPlans) {
      return res.status(404).json({ message: "No subscription plan found." });
    }

    res.status(200).json({ data: selectedPlans });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  selectSubscriptionPlan,
  getSelectedSubscriptionPlan,
};
