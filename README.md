# Human Resources Management System
### Web app with Java SpringBoot backend and React frontend

- Web app developed for employee, organizational, payroll, leaves and performance evaluation management for use on intranet across entire organization
- Backend in Java using Spring Boot (RESTful API), Spring Security (JWT, Authentication), Spring Data (JPA), Maven, H2 Database, Lombok
- Frontend using React (Javascript) and Prime React with Axios for communication with backend
- OpenAI API calls for employee performance feedback generation

## Features
- 3 Types of users (ADMIN, MANAGER, USER)
    - ADMINISTRATOR can create and manage accounts. MANAGER can modify teams, salaries, profiles, leaves and performance evaluations. USER has read-only rights (except for his own profile)
    - Management pages conditionally appear based on user type
    - API checks for user permissions before any action is taken
- Personal profile
  - Displays seniority in the organisation, direct manager, direct colleagues
  - Avatar management
  - Personal information management
  - Profiles can be shared using a link
- Search bar present at all times in the menu bar for looking up employees profiles
- Organigram (Hierarchy graph structure of the company)
  - All teams visualisation (with hierarchy tree navigation)
  - Direct colleagues page
  - Subordinates page
- Performance:
  - Current evaluation grading with history (based on 5 criterias: Communication, Efficiency, Expertise, Initiative, Leadership) and feedback
  - Feedback of an evaluation can be generated using OpenAi API
  - Teams performance page with the average grade of each team
  - View individual performance grades of each team member (emphasizing the least and most performant criterias)
  - Evaluations manager for the entire organization
- Salary:
  - Evolution of salaries can be viewed as a graph
  - View current salary package as well as history for each salary component (base, performance bonus, projects bonus, meal tickets, life insurance, benefits)
  - Salaries of teams page shows the total costs of the organisation for specific teams as well as individual member salaries
  - Salaries manager for modifying salary packages of any account. Also displays organisational statistics (average salary, total expenses, most expensive salary component)
- Leaves:
  - Calendar for viewing and initiating leave days requests to be approved by a superior
  - List of all leave days requests initiated and their status
  - Leaves manager to modify any organisation user's leave requests
    - View of subordinates leave requests at the top
    - Modify available leave days of any user
  - Holidays manager: change the holidays that appear in all users calendars
- Reports (with graphs):
  - Correlation coefficient between salaries and evaluations of a selected user
  - Employees distribution by age
  - Scatter plot of employees' seniority, age and evaluation
- Accounts manager:
  -  Modify, remove accounts
      - Attempting to remove accounts with subordinates will prompt the user to select a new manager in order to transfer the subordinates to it before account deletion takes action
  -  Account creation
  -  Team manager:
      - Create a new team by selecting a manager and subordinates
      - Team visualisation with options to add/remove selected members, change the team's manager or remove all members
      - Backend performs checks for circular references
- Localisation button visible accross entire app. English, Romanian are supported. More languages can be added.
  

## Running the project
1. Clone the repo
2. Open the BACKEND folder in Intellij IDEA
3. Add an OpenAI API key in src/main/resources/application.properties (app.OpenAiApiKey = <YOUR_KEY>)
4. Run the BACKEND
5. Open the FRONTEND folder in terminal
6. Run npm install --legacy-peer-deps
7. Run npm install --force
8. Run npm start
9. Use username:2@2 and password: 2 to login into the app
