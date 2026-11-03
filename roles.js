/* ==========================================================
   roles.js — job-role profiles used for role prediction,
   Resume–Job Match Score, skill gaps, interview questions
   and career path.

   core         : must-have skills (weighted heavily)
   support      : nice-to-have skills, ordered by importance
   supportTarget: how many supporting skills count as "full coverage"
   signature    : skills that identify the role (a resume with none of
                  these is unlikely to be this role)
   keywords     : job-title words; if they appear in the resume the role
                  gets a small boost
   ladder       : [entry, mid, senior, lead] titles
   ========================================================== */
(function (root) {
  'use strict';
  var HB = root.HB = root.HB || {};

  HB.ROLES = [
    {
      id: 'frontend', title: 'Frontend Developer',
      core: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design', 'Git'],
      support: ['TypeScript', 'Next.js', 'Redux', 'Tailwind CSS', 'Jest', 'REST APIs', 'Figma', 'Webpack', 'Accessibility', 'Angular', 'Vue.js', 'Bootstrap'],
      supportTarget: 5,
      signature: ['React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'Next.js'],
      keywords: ['frontend', 'front-end', 'front end', 'ui developer', 'web developer'],
      ladder: ['Junior Frontend Developer', 'Frontend Developer', 'Senior Frontend Engineer', 'Lead Frontend Engineer / Frontend Architect'],
      questions: [
        'How does the browser turn HTML, CSS and JavaScript into pixels on screen?',
        'Explain the difference between state and props, and when you would lift state up or use a global store.',
        'How do you make a page both responsive and accessible?',
        'What causes unnecessary re-renders in a component tree, and how would you find and fix them?',
        'How would you speed up a slow single-page application?'
      ]
    },
    {
      id: 'backend', title: 'Backend Developer',
      core: ['REST APIs', 'SQL', 'Git', 'OOP', 'Data Structures'],
      support: ['Node.js', 'Spring Boot', 'Django', 'Flask', 'FastAPI', 'Express.js', '.NET', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'Microservices', 'System Design', 'AWS', 'GraphQL', 'Unit Testing', 'Java', 'Python'],
      supportTarget: 6,
      signature: ['Node.js', 'Spring Boot', 'Django', 'Flask', 'FastAPI', 'Express.js', '.NET', 'Laravel', 'Microservices'],
      keywords: ['backend', 'back-end', 'back end', 'api developer', 'server-side'],
      ladder: ['Junior Backend Developer', 'Backend Developer', 'Senior Backend Engineer', 'Lead Backend Engineer / Solutions Architect'],
      questions: [
        'Design a REST API for orders: which endpoints, status codes, validation and pagination would you use?',
        'Explain database indexing and describe a case where an index can hurt performance.',
        'How do you handle authentication and authorization in an API?',
        'A service suddenly gets 10x traffic. How do you find the bottleneck and scale it?',
        'When would you choose a NoSQL database over a relational one?'
      ]
    },
    {
      id: 'fullstack', title: 'Full Stack Developer',
      core: ['HTML', 'CSS', 'JavaScript', 'REST APIs', 'Git', 'SQL'],
      support: ['React', 'Node.js', 'MongoDB', 'Express.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Next.js', 'AWS', 'MySQL', 'Angular', 'Django'],
      supportTarget: 5,
      signature: ['React', 'Node.js', 'Angular', 'Vue.js', 'Express.js', 'Django'],
      keywords: ['full stack', 'full-stack', 'fullstack', 'mern', 'mean stack'],
      ladder: ['Junior Full Stack Developer', 'Full Stack Developer', 'Senior Full Stack Engineer', 'Lead Engineer / Technical Architect'],
      questions: [
        'Walk through what happens from a button click in the UI to a row saved in the database.',
        'How do you structure a project so that frontend and backend can evolve independently?',
        'How would you secure a login flow end to end (password storage, tokens, CORS)?',
        'How do you manage state that is shared across many components?',
        'How do you debug a bug that only appears in production?'
      ]
    },
    {
      id: 'data-analyst', title: 'Data Analyst',
      core: ['SQL', 'Excel', 'Data Analysis', 'Data Visualization', 'Statistics'],
      support: ['Python', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'Matplotlib', 'ETL', 'Seaborn', 'R', 'Jupyter'],
      supportTarget: 4,
      signature: ['Tableau', 'Power BI', 'Excel', 'Data Analysis', 'Data Visualization'],
      keywords: ['data analyst', 'business analyst', 'analytics'],
      ladder: ['Junior Data Analyst', 'Data Analyst', 'Senior Data Analyst', 'Analytics Lead / Analytics Manager'],
      questions: [
        'How do you find and handle missing values and outliers in a dataset?',
        'Describe a SQL query that returns the top 3 customers by revenue in each region.',
        'Which chart would you use to show a trend versus a comparison, and why?',
        'A key metric dropped 15% this week. How do you investigate?',
        'Explain correlation versus causation with an example from your own work.'
      ]
    },
    {
      id: 'data-scientist', title: 'Data Scientist',
      core: ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'SQL'],
      support: ['Scikit-learn', 'Data Visualization', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Matplotlib', 'Jupyter', 'NLP', 'Apache Spark', 'Seaborn'],
      supportTarget: 5,
      signature: ['Machine Learning', 'Statistics', 'Scikit-learn', 'Deep Learning'],
      keywords: ['data scientist', 'data science'],
      ladder: ['Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist / Head of Data Science'],
      questions: [
        'How do you choose between precision, recall and F1 for a given problem?',
        'Explain overfitting and three ways to reduce it.',
        'Walk me through an end-to-end ML project: data, features, model and evaluation.',
        'How do you handle class imbalance?',
        'Explain the bias–variance trade-off.'
      ]
    },
    {
      id: 'ml-engineer', title: 'ML Engineer',
      core: ['Python', 'Machine Learning', 'Deep Learning', 'Scikit-learn', 'Git'],
      support: ['TensorFlow', 'PyTorch', 'Keras', 'NLP', 'Computer Vision', 'Docker', 'AWS', 'LLMs', 'Hugging Face', 'Pandas', 'NumPy', 'Kubernetes'],
      supportTarget: 5,
      signature: ['Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Computer Vision', 'NLP', 'LLMs'],
      keywords: ['machine learning engineer', 'ml engineer', 'ai engineer', 'ai/ml'],
      ladder: ['Junior ML Engineer', 'ML Engineer', 'Senior ML Engineer', 'Lead ML Engineer / AI Architect'],
      questions: [
        'How would you deploy a trained model so it serves predictions with low latency?',
        'How do you detect data drift or model decay in production?',
        'Explain backpropagation in simple terms.',
        'How do you version datasets and models so experiments are reproducible?',
        'What trade-offs do you weigh between a large model and a smaller distilled one?'
      ]
    },
    {
      id: 'devops', title: 'DevOps / Cloud Engineer',
      core: ['Linux', 'Docker', 'CI/CD', 'Git', 'Bash'],
      support: ['Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins', 'Monitoring & Observability', 'Nginx', 'Python'],
      supportTarget: 5,
      signature: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Ansible', 'Jenkins', 'AWS', 'Azure', 'GCP'],
      keywords: ['devops', 'cloud engineer', 'site reliability', 'sre'],
      ladder: ['Junior DevOps Engineer', 'DevOps / Cloud Engineer', 'Senior DevOps Engineer', 'Lead DevOps Engineer / Cloud Architect'],
      questions: [
        'Describe the CI/CD pipeline you would set up for a web service.',
        'What is the difference between a container and a virtual machine?',
        'How do you achieve zero-downtime deployments?',
        'A pod keeps restarting with CrashLoopBackOff. How do you debug it?',
        'How do you manage secrets and infrastructure as code safely?'
      ]
    },
    {
      id: 'mobile', title: 'Mobile App Developer',
      core: ['OOP', 'REST APIs', 'Git'],
      support: ['Android', 'Flutter', 'React Native', 'Kotlin', 'Swift', 'iOS', 'Dart', 'Firebase', 'Java'],
      supportTarget: 3,
      signature: ['Android', 'iOS', 'Flutter', 'React Native', 'Swift', 'Kotlin', 'Dart'],
      keywords: ['mobile developer', 'android developer', 'ios developer', 'app developer', 'mobile app'],
      ladder: ['Junior Mobile Developer', 'Mobile App Developer', 'Senior Mobile Engineer', 'Lead Mobile Engineer / Mobile Architect'],
      questions: [
        'How do you manage app state and offline data?',
        'Explain the app/activity lifecycle and why it matters.',
        'How do you keep the UI smooth while fetching data from the network?',
        'How would you implement push notifications and deep links?',
        'How do you test and release a mobile app to the stores?'
      ]
    },
    {
      id: 'ux', title: 'UI/UX Designer',
      core: ['Figma', 'Wireframing', 'Prototyping', 'UI/UX Design', 'UX Research'],
      support: ['Adobe XD', 'Sketch', 'Design Systems', 'Accessibility', 'Photoshop', 'Illustrator', 'HTML', 'CSS', 'Responsive Design'],
      supportTarget: 4,
      signature: ['Figma', 'Adobe XD', 'Sketch', 'Wireframing', 'UI/UX Design', 'UX Research', 'Design Systems'],
      keywords: ['ui/ux', 'ux designer', 'ui designer', 'product designer', 'ux researcher'],
      ladder: ['Junior UI/UX Designer', 'UI/UX Designer', 'Senior Product Designer', 'Lead Designer / Head of Design'],
      questions: [
        'Walk me through one project from user research to final design.',
        'How do you test a design with real users and act on the feedback?',
        'How do you balance business goals with user needs?',
        'How do you design for accessibility?',
        'How do you hand designs over to developers?'
      ]
    },
    {
      id: 'qa', title: 'QA / Test Engineer',
      core: ['Manual Testing', 'Test Automation', 'Selenium', 'JIRA', 'SQL'],
      support: ['Postman', 'Cypress', 'Pytest', 'JUnit', 'Jest', 'Agile', 'Python', 'Java', 'CI/CD', 'Unit Testing', 'Git'],
      supportTarget: 5,
      signature: ['Selenium', 'Manual Testing', 'Test Automation', 'Cypress', 'Pytest', 'JUnit', 'Postman', 'JMeter', 'Playwright'],
      keywords: ['qa engineer', 'test engineer', 'quality assurance', 'sdet', 'tester'],
      ladder: ['Junior QA Engineer', 'QA / Test Engineer', 'Senior QA / SDET', 'QA Lead / Test Manager'],
      questions: [
        'How do you decide what to automate and what to test manually?',
        'Write test cases for a login page.',
        'What is the difference between bug severity and priority?',
        'How do you make flaky automated tests reliable?',
        'How do you structure and maintain a regression suite?'
      ]
    },
    {
      id: 'security', title: 'Cybersecurity Analyst',
      core: ['Cybersecurity', 'Computer Networks', 'Linux', 'Incident Response', 'OWASP'],
      support: ['Penetration Testing', 'SIEM', 'Wireshark', 'Nmap', 'Cryptography', 'Python', 'Bash'],
      supportTarget: 4,
      signature: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'OWASP', 'Wireshark', 'Nmap', 'Cryptography', 'Incident Response'],
      keywords: ['security analyst', 'cybersecurity', 'soc analyst', 'penetration tester', 'infosec'],
      ladder: ['Junior Security Analyst', 'Cybersecurity Analyst', 'Senior Security Engineer', 'Security Lead / Security Architect'],
      questions: [
        'Which OWASP Top 10 risks do you see most often, and how do you prevent them?',
        'How would you investigate a suspected phishing incident?',
        'Compare symmetric and asymmetric encryption with an example.',
        'How would you harden a Linux server?',
        'How does a SIEM help detect attacks?'
      ]
    },
    {
      id: 'software-engineer', title: 'Software Engineer',
      core: ['Data Structures', 'Algorithms', 'OOP', 'Git', 'Problem Solving'],
      support: ['Java', 'Python', 'C++', 'SQL', 'System Design', 'Design Patterns', 'Unit Testing', 'Agile', 'Linux', 'REST APIs'],
      supportTarget: 5,
      signature: ['Data Structures', 'Algorithms', 'OOP', 'Design Patterns', 'System Design'],
      keywords: ['software engineer', 'software developer', 'sde'],
      ladder: ['Junior Software Engineer', 'Software Engineer', 'Senior Software Engineer', 'Staff Engineer / Engineering Manager'],
      questions: [
        'State the time and space complexity of a solution you recently wrote and how you could improve it.',
        'How do you decide between a hash map, a tree and an array?',
        'Explain the SOLID principles with an example.',
        'What do you look for when reviewing someone else\'s code?',
        'Walk me through designing a URL shortener.'
      ]
    }
  ];

  // Career-level metadata (index into role.ladder)
  HB.LEVELS = {
    fresher: { label: 'Fresher / Student', ladderIndex: 0, nextTimeline: 'typically within 2–3 years' },
    junior:  { label: 'Junior (1–3 yrs)',  ladderIndex: 0, nextTimeline: 'typically within 1–2 years' },
    mid:     { label: 'Mid-level (3–6 yrs)', ladderIndex: 1, nextTimeline: 'typically within 2–3 years' },
    senior:  { label: 'Senior (6+ yrs)',   ladderIndex: 2, nextTimeline: 'typically within 2–4 years' }
  };
})(typeof window !== 'undefined' ? window : globalThis);
