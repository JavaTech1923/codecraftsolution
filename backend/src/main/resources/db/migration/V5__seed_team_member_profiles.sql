UPDATE site_content
SET payload = $profiles$[
  {"name":"Maya Chen","role":"Senior Full-Stack Engineer","photoUrl":"https://randomuser.me/api/portraits/women/68.jpg","techStack":["Angular","TypeScript","Node.js","PostgreSQL"],"experienceYears":8,"currentCompany":"Demo Company","order":1},
  {"name":"Ethan Brooks","role":"Senior Backend Engineer","photoUrl":"https://randomuser.me/api/portraits/men/32.jpg","techStack":["Java","Spring Boot","PostgreSQL","AWS"],"experienceYears":11,"currentCompany":"Demo Company","order":2},
  {"name":"Priya Nair","role":"Lead Frontend Engineer","photoUrl":"https://randomuser.me/api/portraits/women/44.jpg","techStack":["Angular","TypeScript","RxJS","NgRx"],"experienceYears":9,"currentCompany":"Demo Company","order":3},
  {"name":"Daniel Kim","role":"Cloud Platform Engineer","photoUrl":"https://randomuser.me/api/portraits/men/65.jpg","techStack":["AWS","Kubernetes","Terraform","Docker"],"experienceYears":7,"currentCompany":"Demo Company","order":4},
  {"name":"Sofia Martinez","role":"Quality Automation Engineer","photoUrl":"https://randomuser.me/api/portraits/women/63.jpg","techStack":["Playwright","Cypress","Selenium","Jest"],"experienceYears":8,"currentCompany":"Demo Company","order":5},
  {"name":"Oliver Reed","role":"Mobile Engineer","photoUrl":"https://randomuser.me/api/portraits/men/76.jpg","techStack":["Kotlin","Android","Firebase","REST APIs"],"experienceYears":6,"currentCompany":"Demo Company","order":6},
  {"name":"Aisha Khan","role":"DevOps Engineer","photoUrl":"https://randomuser.me/api/portraits/women/52.jpg","techStack":["Azure","Kubernetes","GitHub Actions","Terraform"],"experienceYears":10,"currentCompany":"Demo Company","order":7},
  {"name":"Lucas Bennett","role":"Data Engineer","photoUrl":"https://randomuser.me/api/portraits/men/46.jpg","techStack":["Python","Spark","Airflow","PostgreSQL"],"experienceYears":12,"currentCompany":"Demo Company","order":8},
  {"name":"Emma Wilson","role":"Full-Stack Engineer","photoUrl":"https://randomuser.me/api/portraits/women/28.jpg","techStack":["React","Node.js","TypeScript","MongoDB"],"experienceYears":7,"currentCompany":"Demo Company","order":9},
  {"name":"Noah Patel","role":"Solutions Architect","photoUrl":"https://randomuser.me/api/portraits/men/51.jpg","techStack":["Java","Microservices","AWS","Kubernetes"],"experienceYears":14,"currentCompany":"Demo Company","order":10},
  {"name":"Isabella Garcia","role":"Application Security Engineer","photoUrl":"https://randomuser.me/api/portraits/women/75.jpg","techStack":["Spring Security","OAuth 2.0","OWASP","Java"],"experienceYears":7,"currentCompany":"Demo Company","order":11},
  {"name":"Jacob Thompson","role":"Frontend Engineer","photoUrl":"https://randomuser.me/api/portraits/men/18.jpg","techStack":["React","Next.js","TypeScript","Tailwind CSS"],"experienceYears":6,"currentCompany":"Demo Company","order":12},
  {"name":"Amara Okafor","role":"Machine Learning Engineer","photoUrl":"https://randomuser.me/api/portraits/women/83.jpg","techStack":["Python","PyTorch","FastAPI","PostgreSQL"],"experienceYears":8,"currentCompany":"Demo Company","order":13},
  {"name":"Leo Fischer","role":"Senior Backend Engineer","photoUrl":"https://randomuser.me/api/portraits/men/84.jpg","techStack":["Go","PostgreSQL","Redis","Docker"],"experienceYears":13,"currentCompany":"Demo Company","order":14},
  {"name":"Grace Liu","role":"Design Systems Engineer","photoUrl":"https://randomuser.me/api/portraits/women/12.jpg","techStack":["Figma","Angular","Storybook","Accessibility"],"experienceYears":6,"currentCompany":"Demo Company","order":15}
]$profiles$::jsonb
WHERE content_key = 'team'
  AND payload @> '[{"title":"Backend Engineers","percentage":96}]'::jsonb;
