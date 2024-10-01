import axios from 'axios';

const API_URL = 'https://ects-cmp.com/';

const fetchPosts = async (page) => {
  try {
    const response = await axios.get(`${API_URL}appfeeds/ecosystem/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export { fetchPosts };
