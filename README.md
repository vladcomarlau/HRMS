# Human Resources Management System
### Web app with Java SpringBoot backend and React frontend

- Web app developed for employee, organizational, payroll, leaves and performance evaluation management for use on intranet across entire organization
- Backend in Java using Spring Boot (RESTful API), Spring Security (JWT, Authentication), Spring Data (JPA), Maven, H2 Database, Lombok
- Frontend using React (Javascript) and Prime React with Axios for communication with backend
- OpenAI API calls for employee performance feedback generation

### Running the prooject
1. Clone the repo
2. Open the BACKEND folder in Intellij IDEA
3. Add an OpenAI API key in src/main/resources/application.properties (app.OpenAiApiKey = <YOUR_KEY>)
4. Run the BACKEND
5. Open the FRONTEND folder in terminal
6. Run npm install --legacy-peer-deps
7. Run npm install --force
8. Run npm start
9. Use username:2@2 and password: 2 to login into the app
