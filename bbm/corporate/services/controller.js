const { db } = require("../../database/config");
const {
  getCorporateUserData,
  checkAdminSuperAdmin,
  getUserData,
} = require("../utility/utilityFunction");
const Corporate = db.collection("corporate");
const CorporateUser = db.collection("corporateUser");
const CorporateServices = db.collection("corporateServices");

/**
* Endpoint: POST /:corporateId
* 
* Description:
* Creates a service for a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateID.
*
* Request Body:
{
    "serviceName": "xyz service",
    "serviceCategory": "abc category",
    "serviceImg": "https://image.com",
    "serviceDescription": "description",
    "price": "55",
    "currency": "$",
    "availability": [
        {
            "day": "monday",
            "from": "11 am",
            "to": "12pm"
        }
    ],
     "allDays": {
        "enable": true,
        "from": "11 am",
        "to": "12pm"
    },
    "enable": true
}
*    
* Response:
* - Status Code: 200
* - Body: 

   "data": {
        "_id": "corporateServices/5323481",
        "_key": "5323481",
        "_rev": "_icUcg-i---"
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

const createService = async (req, res) => {
  try {
    const {
      serviceName,
      serviceCategory,
      serviceImg,
      serviceDescription,
      price,
      currency,
      availability,
      allDays,
      enable,
    } = req.body;

    const corporateId = req.params.corporateId;

    const user = await getUserData(req.user.sub);
    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }

    const create = await CorporateServices.save({
      corporateId,
      serviceName,
      serviceCategory,
      serviceImg,
      serviceDescription,
      price,
      currency,
      availability,
      allDays,
      enable,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({ data: create });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: PUT /:corporateId/:serviceId
* 
* Description:
* Updates a service for a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateId.
* - serviceId (integer, query): The serviceId.
*
* Request Body:
{
    "serviceName": "xyz service",
    "serviceCategory": "abc category",
    "serviceImg": "https://image.com",
    "serviceDescription": "description",
    "price": "55",
    "currency": "$",
    "availability": [
        {
            "day": "monday",
            "from": "11 am",
            "to": "12pm"
        }
    ],
     "allDays": {
        "enable": true,
        "from": "11 am",
        "to": "12pm"
    },
    "enable": true
}
*    
* Response:
* - Status Code: 200
* - Body: 

   "data": {
        "_id": "corporateServices/5323481",
        "_key": "5323481",
        "_rev": "_icUxY9a---",
        "_oldRev": "_icUxI32---"
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

const updateService = async (req, res) => {
  try {
    const {
      serviceName,
      serviceCategory,
      serviceImg,
      serviceDescription,
      price,
      currency,
      availability,
      allDays,
      enable,
    } = req.body;

    const corporateId = req.params.corporateId;
    const serviceId = req.params.serviceId;

    const user = await getUserData(req.user.sub);
    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }

    const updateService = await CorporateServices.update(serviceId, {
      corporateId,
      serviceName,
      serviceCategory,
      serviceImg,
      serviceDescription,
      price,
      currency,
      availability,
      allDays,
      enable,
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
* Get all the services for a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateId.
*    
* Response:
* - Status Code: 200
* - Body: 

  "data": [
        {
            "_key": "5323481",
            "_id": "corporateServices/5323481",
            "_rev": "_icUxY9a---",
            "corporateId": "4085721",
            "serviceName": "xy service",
            "serviceCategory": "abc category",
            "serviceImg": "https://image.com",
            "serviceDescription": "description",
            "price": "55",
            "currency": "$",
            "availability": [
                {
                    "day": "monday",
                    "from": "11 am",
                    "to": "12pm"
                }
            ],
            "allDays": true,
            "enable": true,
            "createdAt": "2024-09-12T09:44:17.659Z",
            "updatedAt": "2024-09-12T10:07:06.730Z"
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

const getAllServices = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;

    const getServicesCursor = await db.query(`
    FOR doc IN corporateServices
    FILTER doc.corporateId == "${corporateId}"
    RETURN doc
    `);

    const getServices = await getServicesCursor.all();

    res.status(200).json({ data: getServices });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: GET /id/:serviceId
* 
* Description:
* Get the service by its id for a corporate page.
* 
* Request Parameters:
* - serviceId (integer, query): The serviceId.
*    
* Response:
* - Status Code: 200
* - Body: 

  "data": {
        "_key": "5323481",
        "_id": "corporateServices/5323481",
        "_rev": "_icUxY9a---",
        "corporateId": "4085721",
        "serviceName": "xy service",
        "serviceCategory": "abc category",
        "serviceImg": "https://image.com",
        "serviceDescription": "description",
        "price": "55",
        "currency": "$",
        "availability": [
            {
                "day": "monday",
                "from": "11 am",
                "to": "12pm"
            }
        ],
        "allDays": true,
        "enable": true,
        "createdAt": "2024-09-12T09:44:17.659Z",
        "updatedAt": "2024-09-12T10:07:06.730Z"
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

const getServiceById = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;

    const getServiceCursor = await CorporateServices.document(serviceId);

    res.status(200).json({ data: getServiceCursor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
* Endpoint: DELETE /:corporateId/:serviceId
* 
* Description:
* Delete a service from a corporate page.
* 
* Request Parameters:
* - corporateId (integer, query): The corporateId.
* - serviceId (integer, query): The serviceId.
*
*    
* Response:
* - Status Code: 200
* - Body: 

    "data": {
        "_id": "corporateServices/5323481",
        "_key": "5323481",
        "_rev": "_icUxY9a---"
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

const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const corporateId = req.params.corporateId;

    const user = await getUserData(req.user.sub);
    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });
    console.log(admin);
    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }
    const removeService = await CorporateServices.remove(serviceId);

    res
      .status(200)
      .json({ data: removeService, message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = {
  createService,
  updateService,
  getAllServices,
  getServiceById,
  deleteService,
};
