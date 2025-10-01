import axios from './axios';

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  isPublic: boolean;
  durationMinutes: number;
  allowedUsers?: string[];
}

export interface UpdatePollData {
  title?: string;
  description?: string;
}

export interface VoteData {
  optionIndex: number;
}

export interface Poll {
  _id: string;
  title: string;
  description?: string;
  options: {
    text: string;
    votes: number;
    votedBy: string[];
  }[];
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  isPublic: boolean;
  allowedUsers: string[];
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PollResults {
  pollId: string;
  title: string;
  description?: string;
  totalVotes: number;
  isActive: boolean;
  expiresAt: string;
  results: {
    text: string;
    votes: number;
    percentage: string;
  }[];
}

export const pollsApi = {
  create: async (data: CreatePollData): Promise<Poll> => {
    const response = await axios.post('/polls', data);
    return response.data;
  },

  getAll: async (): Promise<Poll[]> => {
    const response = await axios.get('/polls');
    return response.data;
  },

  getMyPolls: async (): Promise<Poll[]> => {
    const response = await axios.get('/polls/my-polls');
    return response.data;
  },

  getOne: async (id: string): Promise<Poll> => {
    const response = await axios.get(`/polls/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdatePollData): Promise<Poll> => {
    const response = await axios.patch(`/polls/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`/polls/${id}`);
  },

  vote: async (id: string, data: VoteData): Promise<Poll> => {
    const response = await axios.post(`/polls/${id}/vote`, data);
    return response.data;
  },

  getResults: async (id: string): Promise<PollResults> => {
    const response = await axios.get(`/polls/${id}/results`);
    return response.data;
  },
};
