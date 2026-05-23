import { api } from './client';

export const listPolls = (meetingId) =>
  api.get(`/meetings/${meetingId}/polls`).then((r) => r.data);

export const createPoll = (meetingId, input) =>
  api.post(`/meetings/${meetingId}/polls`, input).then((r) => r.data);

export const closePoll = (meetingId, pollId) =>
  api.post(`/meetings/${meetingId}/polls/${pollId}/close`).then((r) => r.data);

export const castVote = (meetingId, pollId, option) =>
  api.post(`/meetings/${meetingId}/polls/${pollId}/vote`, { option }).then((r) => r.data);
