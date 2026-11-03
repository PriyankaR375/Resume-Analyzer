/* ==========================================================
   skills.js — skill dictionary
   Each skill: { name, category, aliases[], exact? }
   - The skill name itself is always matched (case-insensitive)
     unless `exact` is true (used for 1–2 letter names such as
     C, R, Go, which are only matched as whole tokens inside the
     Skills section to avoid false positives).
   ========================================================== */
(function (root) {
  'use strict';
  var HB = root.HB = root.HB || {};

  function S(name, category, aliases, exact) {
    return { name: name, category: category, aliases: aliases || [], exact: !!exact };
  }

  var PL = 'Programming Languages', FE = 'Frontend', BE = 'Backend', DB = 'Databases',
      CL = 'Cloud & DevOps', ML = 'Data & AI', DS = 'Design', TS = 'Testing',
      MB = 'Mobile', SC = 'Security', CS = 'CS Fundamentals', TL = 'Tools & Practices',
      SO = 'Soft Skills';

  HB.SKILLS = [
    // Programming languages
    S('Python', PL, ['python3']),
    S('Java', PL, ['core java']),
    S('JavaScript', PL, ['es6', 'ecmascript', 'vanilla js']),
    S('TypeScript', PL),
    S('C++', PL),
    S('C#', PL, ['csharp']),
    S('C', PL, ['c programming', 'c language'], true),
    S('Go', PL, ['golang'], true),
    S('Rust', PL),
    S('Kotlin', PL),
    S('Swift', PL),
    S('PHP', PL),
    S('Ruby', PL, ['ruby on rails', 'rails']),
    S('R', PL, ['r programming', 'r language', 'rstudio'], true),
    S('Scala', PL),
    S('MATLAB', PL),
    S('Dart', PL),
    S('Bash', PL, ['shell scripting', 'bash scripting', 'shell script']),

    // Frontend
    S('HTML', FE, ['html5']),
    S('CSS', FE, ['css3']),
    S('React', FE, ['react.js', 'reactjs']),
    S('Angular', FE, ['angularjs', 'angular js']),
    S('Vue.js', FE, ['vue', 'vuejs']),
    S('Next.js', FE, ['nextjs', 'next js']),
    S('Redux', FE, ['redux toolkit']),
    S('Tailwind CSS', FE, ['tailwind', 'tailwindcss']),
    S('Bootstrap', FE),
    S('SASS', FE, ['scss']),
    S('jQuery', FE),
    S('Webpack', FE, ['vite']),
    S('Responsive Design', FE, ['responsive web design', 'responsive layout', 'responsive layouts', 'mobile-first', 'responsive ui', 'responsive web apps', 'responsive websites', 'responsive']),
    S('Accessibility', FE, ['wcag', 'a11y', 'accessible']),

    // Backend
    S('Node.js', BE, ['nodejs', 'node js']),
    S('Express.js', BE, ['expressjs', 'express js']),
    S('Spring Boot', BE, ['spring framework', 'spring mvc', 'springboot']),
    S('Django', BE),
    S('Flask', BE),
    S('FastAPI', BE),
    S('.NET', BE, ['asp.net', 'dotnet', '.net core']),
    S('Laravel', BE),
    S('REST APIs', BE, ['rest api', 'restful api', 'restful apis', 'restful services', 'restful web services', 'api development']),
    S('GraphQL', BE),
    S('Microservices', BE, ['microservice', 'microservices architecture']),

    // Databases
    S('SQL', DB, ['t-sql', 'pl/sql']),
    S('MySQL', DB),
    S('PostgreSQL', DB, ['postgres']),
    S('MongoDB', DB, ['mongo db']),
    S('Redis', DB),
    S('SQLite', DB),
    S('Oracle', DB, ['oracle db']),
    S('Firebase', DB),
    S('Elasticsearch', DB),
    S('NoSQL', DB),
    S('DBMS', DB, ['database management', 'database design', 'rdbms']),

    // Cloud & DevOps
    S('AWS', CL, ['amazon web services', 'ec2', 'aws lambda']),
    S('Azure', CL, ['microsoft azure']),
    S('GCP', CL, ['google cloud', 'google cloud platform']),
    S('Docker', CL, ['containerization', 'dockerfile', 'docker compose']),
    S('Kubernetes', CL, ['k8s']),
    S('Terraform', CL, ['infrastructure as code']),
    S('Ansible', CL),
    S('Jenkins', CL),
    S('CI/CD', CL, ['ci cd', 'continuous integration', 'continuous deployment', 'github actions', 'gitlab ci']),
    S('Linux', CL, ['ubuntu', 'unix', 'centos', 'red hat']),
    S('Nginx', CL),
    S('Monitoring & Observability', CL, ['prometheus', 'grafana', 'datadog', 'observability', 'elk stack']),

    // Data & AI
    S('Machine Learning', ML, ['supervised learning', 'unsupervised learning', 'ml models']),
    S('Deep Learning', ML, ['neural networks', 'neural network', 'cnn', 'rnn', 'lstm']),
    S('NLP', ML, ['natural language processing', 'text mining', 'spacy', 'nltk']),
    S('Computer Vision', ML, ['opencv', 'image processing', 'object detection', 'image classification']),
    S('TensorFlow', ML),
    S('PyTorch', ML),
    S('Keras', ML),
    S('Scikit-learn', ML, ['sklearn', 'scikit learn']),
    S('Pandas', ML),
    S('NumPy', ML),
    S('Data Analysis', ML, ['data analytics', 'exploratory data analysis', 'eda']),
    S('Data Visualization', ML, ['data visualisation', 'data visualizations', 'power bi dashboards', 'tableau dashboards']),
    S('Tableau', ML),
    S('Power BI', ML, ['powerbi']),
    S('Excel', ML, ['ms excel', 'microsoft excel', 'advanced excel', 'vlookup', 'pivot tables']),
    S('Statistics', ML, ['statistical analysis', 'hypothesis testing', 'statistical modeling', 'regression analysis']),
    S('Apache Spark', ML, ['spark', 'pyspark']),
    S('Hadoop', ML),
    S('ETL', ML, ['data pipelines', 'data pipeline', 'data warehousing', 'data engineering']),
    S('Matplotlib', ML),
    S('Seaborn', ML),
    S('Jupyter', ML, ['jupyter notebook', 'google colab', 'colab']),
    S('Hugging Face', ML, ['huggingface', 'transformers library']),
    S('LLMs', ML, ['llm', 'large language models', 'generative ai', 'gen ai', 'langchain', 'prompt engineering', 'openai api']),

    // CS fundamentals
    S('Data Structures', CS, ['data structures and algorithms', 'dsa']),
    S('Algorithms', CS, ['algorithm design', 'competitive programming']),
    S('OOP', CS, ['object oriented programming', 'object-oriented', 'object oriented', 'oops', 'oop concepts']),
    S('Design Patterns', CS),
    S('System Design', CS, ['low level design', 'high level design', 'system architecture', 'scalable systems', 'distributed systems']),

    // Design
    S('Figma', DS),
    S('Adobe XD', DS),
    S('Sketch', DS),
    S('Photoshop', DS, ['adobe photoshop']),
    S('Illustrator', DS, ['adobe illustrator']),
    S('Wireframing', DS, ['wireframes', 'wireframe']),
    S('Prototyping', DS, ['prototypes', 'prototype', 'interactive prototypes']),
    S('UI/UX Design', DS, ['ui/ux', 'ui ux', 'ux design', 'ui design', 'user experience', 'user interface design']),
    S('UX Research', DS, ['user research', 'usability testing', 'user interviews', 'user testing']),
    S('Design Systems', DS, ['design system', 'component library']),

    // Testing
    S('Selenium', TS),
    S('Cypress', TS),
    S('Playwright', TS),
    S('Jest', TS),
    S('JUnit', TS),
    S('Pytest', TS),
    S('Postman', TS),
    S('JMeter', TS),
    S('Manual Testing', TS, ['functional testing', 'regression testing', 'test cases']),
    S('Test Automation', TS, ['automation testing', 'automated testing']),
    S('Unit Testing', TS, ['unit tests', 'unit test', 'tdd', 'test driven development']),

    // Mobile
    S('Android', MB, ['android development', 'android studio', 'android sdk']),
    S('iOS', MB, ['ios development', 'xcode']),
    S('Flutter', MB),
    S('React Native', MB),

    // Security
    S('Cybersecurity', SC, ['cyber security', 'information security', 'infosec', 'network security', 'application security']),
    S('Penetration Testing', SC, ['pentesting', 'penetration tester', 'ethical hacking']),
    S('Computer Networks', SC, ['computer networking', 'tcp/ip', 'networking fundamentals', 'network protocols', 'osi model']),
    S('SIEM', SC, ['splunk', 'qradar']),
    S('OWASP', SC),
    S('Cryptography', SC, ['encryption']),
    S('Wireshark', SC),
    S('Nmap', SC, ['kali linux']),
    S('Incident Response', SC, ['incident handling', 'threat detection']),

    // Tools & practices
    S('Git', TL, ['github', 'gitlab', 'bitbucket', 'version control']),
    S('JIRA', TL, ['atlassian']),
    S('Agile', TL, ['agile methodology', 'agile methodologies']),
    S('Scrum', TL),
    S('Project Management', TL, ['project planning']),

    // Soft skills
    S('Communication', SO, ['communication skills', 'presentation skills']),
    S('Leadership', SO, ['team lead', 'team leadership', 'led a team']),
    S('Teamwork', SO, ['team player', 'collaboration', 'collaborative', 'cross-functional']),
    S('Problem Solving', SO, ['analytical skills', 'analytical thinking']),
    S('Critical Thinking', SO),
    S('Time Management', SO),
    S('Adaptability', SO, ['adaptable', 'quick learner']),
    S('Mentoring', SO, ['mentored', 'mentorship'])
  ];

  HB.SKILL_BY_NAME = {};
  HB.SKILLS.forEach(function (s) { HB.SKILL_BY_NAME[s.name] = s; });

  // Display order of categories on the results page
  HB.CATEGORY_ORDER = [PL, FE, BE, DB, CL, ML, CS, DS, TS, MB, SC, TL, SO];
})(typeof window !== 'undefined' ? window : globalThis);
