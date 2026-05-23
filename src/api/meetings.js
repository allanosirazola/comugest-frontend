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

export async function saveMinutes(id, minutes) {
  const { data } = await api.put(`/meetings/${id}/minutes`, { minutes });
  return data;
}

export async function publishMinutes(id, published) {
  const { data } = await api.patch(`/meetings/${id}/minutes/publish`, { published });
  return data;
}

export async function generateQrToken(meetingId) {
  const { data } = await api.post(`/meetings/${meetingId}/qr-token`);
  return data; // { token, qrDataUrl, url }
}

export async function qrCheckIn(token) {
  await api.post(`/meetings/qr-check-in/${token}`);
}

export async function signMinutes(meetingId, totpCode) {
  const { data } = await api.post(`/meetings/${meetingId}/minutes/sign`, { totpCode });
  return data.meeting;
}
