import axios from "axios";

const API_URL = "http://localhost:5000";

export const getCompanies = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/companies`);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error('Unexpected data format from API');
    }
  } catch (error) {
    console.error("Error in getCompanies API call:", error);
    throw error;  // Rethrow the error for further handling
  }
};

export const getCommunicationmethod = async ()=>{
  const response =await axios.get(`${API_URL}/api/communication-methods`);
  return response.data;
}

export const getCommunications = async (companyId) => {
    const response = await axios.get(`${API_URL}/api/communications/company/${companyId}`);
    return response.data;
  };
  
export const addCommunication = async (data) => {
    const response = await axios.post(`${API_URL}/api/communications/add`, data);
    return response.data;
  };
  
export const deleteCommunication = async (id) => {
    const response = await axios.delete(`${API_URL}/api/communications/delete/${id}`);
    return response.data;
  };

export const editcompany = async (id, updatedData)=>{
    const response = await axios.put(`${API_URL}/api/companies/edit/${id}`, updatedData);
    return response.data;
};

export const getcalendar = async (data = {}) => {
    try {
      const response = await axios.get(`${API_URL}/api/calendar`, { params: data });
      return response;
    } catch (error) {
      console.error("Error in getcalendar API call:", error);
      throw error; 
    }
  };
  
export const getreport = async () =>{
    try {
      // console.log('requesting:', `${API_URL}/api/report`,data);
        const response = await axios.get(`${API_URL}/api/report/communication-frequency`);
        return response;
    }
    catch(error){
        console.error("Error in getreport API call:", error);
        throw error;
    }
};