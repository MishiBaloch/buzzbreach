const { db } = require("../../database/config");
const {
  getCorporateUserData,
  checkAdminSuperAdmin,
  getUserData,
} = require("../utility/utilityFunction");
const Corporate = db.collection("corporate");
const CorporateUser = db.collection("corporateUser");
const CareerPath = db.collection("careerPath");

/**
* Endpoint: POST /:corporateId
* 
* Description:
* Creates a career path for a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateID.
*
* Request Body:
{
    "role": "Data engineer",
    "jobLevel": "senior level",
    "range":"1-2",
    "timeframe":"Months",
    "customTimeframe":"12-88",
    "path": [
        {
            "nextProbableRole": "role 12",
            "level": "senior level"
            "range":"1-2",
            "timeframe":"Months"

        },
        {
            "nextProbableRole": "role 13",
            "level": "senior level"
            "range":"1-3",
            "timeframe":"Months"
        }
    ]
}
*    
* Response:
* - Status Code: 200
* - Body: 

   "data": {
        "_id": "careerPath/5328011",
        "_key": "5328011",
        "_rev": "_icW6LD2---"
    }
* 
* Error Responses:
* - Status Code: 400
*   Message: "Invalid query parameters"
* - Status Code: 401
*   Message: "Not authorised"
* - Status Code: 404
*   Message: "User not found"
* Authorization:
* Requires authentication token in the Authorization header.
* 
* Author:
* Rajat Sharma
* 
* Last Modified:
* 12-sep-2024
* 
*/

const createCareerPath = async (req, res) => {
  try {
    const { role, jobLevel, path, range, timeframe, customTimeframe } =
      req.body;

    const corporateId = req.params.corporateId;

    const user = await getUserData(req.user.sub);
    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }

    const create = await CareerPath.save({
      corporateId,
      role,
      jobLevel,
      range,
      timeframe,
      customTimeframe,
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({ data: create });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: PUT /:corporateId/:careerPathId
* 
* Description:
* Updates a career path for a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateId.
* - careerPathId (integer, query): The careerPathId.
*
* Request Body:
{
    "role": "Data engineer",
    "jobLevel": "senior level",
    "range":"1-2",
    "timeframe":"Months",
    "customTimeframe":"12-88",
    "path": [
        {
            "nextProbableRole": "role 12",
            "level": "senior level",
            "range":"1-2",
            "timeframe":"Months"
        },
        {
            "nextProbableRole": "role 13",
            "level": "senior level",
            "range":"1-3",
            "timeframe":"Months"
        }
    ]
}
*    
* Response:
* - Status Code: 200
* - Body: 

   "data": {
        "_id": "careerPath/5328320",
        "_key": "5328320",
        "_rev": "_icXGcyq---",
        "_oldRev": "_icXEGaW---"
    }
* 
* Error Responses:
* - Status Code: 400
*   Message: "Invalid query parameters"
* - Status Code: 401
*   Message: "Not authorised"
* - Status Code: 404
*   Message: "User not found"
* Authorization:
* Requires authentication token in the Authorization header.
* 
* Author:
* Rajat Sharma
* 
* Last Modified:
* 12-sep-2024
* 
*/

const updateCareerPath = async (req, res) => {
  try {
    const { role, jobLevel, path, range, timeframe, customTimeframe } =
      req.body;

    const corporateId = req.params.corporateId;
    const careerPathId = req.params.careerPathId;

    const user = await getUserData(req.user.sub);
    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }

    const updateService = await CareerPath.update(careerPathId, {
      corporateId,
      role,
      jobLevel,
      range,
      timeframe,
      customTimeframe,
      path,
      updatedAt: new Date(),
    });

    res.status(200).json({ data: updateService });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: GET /:corporateId
* 
* Description:
* Get all the career paths for a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateId.
*    
* Response:
* - Status Code: 200
* - Body: 

 "data": [
        {
            "_key": "5328324",
            "_id": "careerPath/5328324",
            "_rev": "_icXEOku---",
            "corporateId": "4085721",
            "role": "Data engineer",
            "jobLevel": "senior level",
            "path": [
                {
                    "nextProbableRole": "role 12",
                    "level": "senior level"
                },
                {
                    "nextProbableRole": "role 13",
                    "level": "senior level"
                }
            ],
            "createdAt": "2024-09-12T12:47:29.886Z",
            "updatedAt": "2024-09-12T12:47:29.886Z"
        },
        {
            "_key": "5328320",
            "_id": "careerPath/5328320",
            "_rev": "_icXGcyq---",
            "corporateId": "4085721",
            "role": "Data Engineer",
            "jobLevel": "senior level",
            "path": [
                {
                    "nextProbableRole": "role 12",
                    "level": "senior level"
                },
                {
                    "nextProbableRole": "role 13",
                    "level": "senior level"
                }
            ],
            "createdAt": "2024-09-12T12:47:21.527Z",
            "updatedAt": "2024-09-12T12:49:55.516Z"
        }
    ]
* 
* Error Responses:
* - Status Code: 400
* Authorization:
* Requires authentication token in the Authorization header.
* 
* Author:
* Rajat Sharma
* 
* Last Modified:
* 12-sep-2024
* 
*/

const getAllCareerPaths = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;

    const getCareerPathCursor = await db.query(`
    FOR doc IN careerPath
    FILTER doc.corporateId == "${corporateId}"
    RETURN doc
    `);

    const getCareerPath = await getCareerPathCursor.all();

    res.status(200).json({ data: getCareerPath });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: GET /id/:careerPathId
* 
* Description:
* Get the career path by its id for a corporate page.
* 
* Request Parameters:
* - careerPathId (integer, query): The careerPathId.
*    
* Response:
* - Status Code: 200
* - Body: 

  "data": {
        "_key": "5328324",
        "_id": "careerPath/5328324",
        "_rev": "_icXEOku---",
        "corporateId": "4085721",
        "role": "Data engineer",
        "jobLevel": "senior level",
        "path": [
            {
                "nextProbableRole": "role 12",
                "level": "senior level"
            },
            {
                "nextProbableRole": "role 13",
                "level": "senior level"
            }
        ],
        "createdAt": "2024-09-12T12:47:29.886Z",
        "updatedAt": "2024-09-12T12:47:29.886Z"
    }
* 
* Error Responses:
* - Status Code: 400
* Authorization:
* Requires authentication token in the Authorization header.
* 
* Author:
* Rajat Sharma
* 
* Last Modified:
* 12-sep-2024
* 
*/

const getCareerPathById = async (req, res) => {
  try {
    const careerPathId = req.params.careerPathId;

    const getCareerPathCursor = await CareerPath.document(careerPathId);

    res.status(200).json({ data: getCareerPathCursor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: DELETE /:corporateId/:careerPathId
* 
* Description:
* Delete a career path from a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateId.
* - careerPathId (integer, query): The careerPathId.
*
*    
* Response:
* - Status Code: 200
* - Body: 

     "data": {
        "_id": "careerPath/5328320",
        "_key": "5328320",
        "_rev": "_icXGcyq---"
    },
    "message": "Deleted successfully"
* 
* Error Responses:
* - Status Code: 400
*   Message: "Invalid query parameters"
* - Status Code: 401
*   Message: "Not authorised"
* - Status Code: 404
*   Message: "User not found"
* Authorization:
* Requires authentication token in the Authorization header.
* 
* Author:
* Rajat Sharma
* 
* Last Modified:
* 12-sep-2024
* 
*/

const deleteCareerPath = async (req, res) => {
  try {
    const careerPathId = req.params.careerPathId;
    const corporateId = req.params.corporateId;

    const user = await getUserData(req.user.sub);

    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }
    const removeCareerPath = await CareerPath.remove(careerPathId);

    res
      .status(200)
      .json({ data: removeCareerPath, message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createCareerPath,
  updateCareerPath,
  getAllCareerPaths,
  getCareerPathById,
  deleteCareerPath,
};