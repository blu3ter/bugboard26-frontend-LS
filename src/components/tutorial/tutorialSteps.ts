import mascotte1 from '../../assets/MascotteBugBoard1.png';
// Note: in the repo this file is named "MascotteBug2.png" (not "MascotteBugBoard2.png").
import mascotte2 from '../../assets/MascotteBug2.png';
import mascotte3 from '../../assets/MascotteBugBoard3.png';
import mascotte4 from '../../assets/MascotteBugBoard4.png';
import mascotteAdmin from '../../assets/MascotteBugBoardAdmin.png';

export interface TutorialStep {
  image: string;
  text: string;
}

export const userTutorialSteps: TutorialStep[] = [
  {
    image: mascotte1,
    text: 'Welcome to the BugBoard26 tutorial! Let me walk you through everything you can do as a User.',
  },
  {
    image: mascotte3,
    text: 'Spotted a bug? Dreaming of an awesome new feature? Or just have a question? Here you can report any issue, and the admins will sort it out.',
  },
  {
    image: mascotte2,
    text: 'But I know what you really want: solving the issues assigned to you! Head to the "My Issues" section to see them all, and click one to view its details. Hit "Send" to submit it to the admins for review.',
  },
  {
    image: mascotte4,
    text: "That's all from your favorite debugger! For any other trouble, just drop an email to info@BugBoard26.com. I'll reply as soon as possible!!!",
  },
];

export const adminTutorialSteps: TutorialStep[] = [
  {
    image: mascotteAdmin,
    text: 'Good evening, boss! Let me walk you through everything you can do as an Administrator.',
  },
  {
    image: mascotte1,
    text: 'Your main job is managing issues in the "Issue Management" section. You can assign new issues in the "Assignment" tab, or decide to close them or send them back to the team from the "Review" tab.',
  },
  {
    image: mascotte3,
    text: 'Spotted a bug? Dreaming of an awesome new feature? Or just have a question? Here you can report any issue.',
  },
  {
    image: mascotte2,
    text: 'But I know what you really want: solving the issues assigned to you! Head to the "My Issues" section to see them all, and click one to view its details. Hit "Send" to submit it for review.',
  },
  {
    image: mascotte4,
    text: "That's all from your favorite debugger! For any other trouble, just drop an email to info@BugBoard26.com. I'll reply as soon as possible!!!",
  },
];

