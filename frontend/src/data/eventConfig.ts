// Organiser settings - change these dates / values before the real event.
export const EVENT = {
  name: 'IoT Young Innovators Hackathon 2026',
  registrationOpens: '2026-10-30', registrationCloses: '2026-11-25',
  eventStart: '2026-12-01', eventEnd: '2026-12-20',
  presentationDates: ['2026-12-01', '2026-12-02', '2026-12-03', '2026-12-04', '2026-12-05'],
  presentationTimes: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
  uploadDeadline: '2026-12-10', evaluationDates: '11 – 14 Dec 2026', resultsOn: '2026-12-20',
  evaluationRounds: [
    { name: 'Round 1 · Project screening', date: '11 – 12 Dec 2026', detail: 'Idea, problem statement, documentation and safety review.' },
    { name: 'Round 2 · Online presentation', date: '13 – 14 Dec 2026', detail: 'Live demo, questions from judges and technical evaluation.' },
    { name: 'Final results & winning teams', date: '20 Dec 2026', detail: 'Final scores, award announcements and certificate release.' },
  ],
  meetingLink: 'https://meet.google.com/your-event-room', // replace with your real room
  passScore: 50,                                           // out of 100 for the Achievement certificate
  judgePin: '2026',                                        // DEMO ONLY - frontend PINs are not secure
  rubric: [['Problem & idea', 20], ['Working circuit / simulation', 25], ['Creativity', 20], ['Safety & responsible design', 15], ['Presentation & documentation', 20]] as [string, number][],
};
export const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
