import { api } from './client';

export async function listMeetings(communityId) {
  const { data } = await api.get(`/communities/${communityId}/meetings`);
  return data.meetings;
}

export async function createMeeting(communityId, input) {
  const { data } = await api.post(`/communities/${communityId}/meetings`, input);
  return data.meeting;
}

export async function getMeeting(id) {
  const { data } = await api.get(`/meetings/${id}`);
  return data.meeting;
}

export async function updateMeeting(id, input) {
  const { data } = await api.patch(`/meetings/${id}`, input);
  return data.meeting;
}

export async function updateAttendance(id, input) {
  const { data } = await api.patch(`/meetings/${id}/attendance`, input);
  return data.attendance;
}
