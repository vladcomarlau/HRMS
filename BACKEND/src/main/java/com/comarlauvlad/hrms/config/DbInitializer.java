package com.comarlauvlad.hrms.config;

import com.comarlauvlad.hrms.HrmsApplication;
import com.comarlauvlad.hrms.entities.*;
import com.comarlauvlad.hrms.repository.UserRepository;
import com.comarlauvlad.hrms.service.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.MessageFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class DbInitializer {

    private static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");

    @Autowired
    private UserRepository userRepository;

    @Value("${app.populateDB}")
    private boolean isPopulateDB;

    public static int createRandomIntBetween(int start, int end) {
        return start + (int) Math.round(Math.random() * (end - start));
    }

    public static LocalDate createRandomDate(int startYear, int endYear) {
        int day = createRandomIntBetween(1, 28);
        int month = createRandomIntBetween(1, 12);
        int year = createRandomIntBetween(startYear, endYear);
        return LocalDate.of(year, month, day);
    }

    public static List<int[]> zileLibereLegale =
            Arrays.asList(
                    new int[] {2024, 1, 1},
                    new int[] {2024, 1, 2},
                    new int[] {2024, 1, 24},
                    new int[] {2024, 5, 1},
                    new int[] {2024, 5, 3},
                    new int[] {2024, 5, 6},
                    new int[] {2024, 6, 24},
                    new int[] {2024, 8, 15},
                    new int[] {2024, 12, 25},
                    new int[] {2024, 12, 26}
            );

    @Bean
    CommandLineRunner runner(UserService userService, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                if(isPopulateDB) {
                    if (true) { //TOTI USERII?   (sau putini?)
                        ObjectMapper mapper = new ObjectMapper();
                        TypeReference<List<User>> typeReference = new TypeReference<>() {
                        };
                        InputStream inputStream = TypeReference.class.getResourceAsStream("/json/users.json");

                        int avatarCount = new File("src/main/resources/avatars").list().length;
                        String[] avatarsList = new File("src/main/resources/avatars").list();
                        byte[][] avatars = new byte[avatarCount][];

                        for (int i = 0; i < avatarCount; i++) {
                            InputStream is = HrmsApplication.class
                                    .getResourceAsStream("/avatars/" + avatarsList[i]);
                            byte[] bytes = is.readAllBytes();
                            avatars[i] = bytes;
                        }

                        try {
                            List<User> users = mapper.readValue(inputStream, typeReference);
                            for (User user : users) {
                                user.setAvatar(new Avatar("avatar.jpg",
                                        "image/jpg",
                                        avatars[ThreadLocalRandom.current().nextInt(
                                                0, avatarCount - 1)]));
                            }

                            //IERARHIE  4 echipe
                            /*
                             * petru luca 0 -> vlad-constantin 1 -> marius marin 10 -> andrei ionescu 20
                             *                                   -> gabriel constantinescu 13
                             *              -> teodor stefan 2   -> mihai iordache 27
                             * */

                            users.get(1).setManager(users.get(3)); //vlad
                            users.get(2).setManager(users.get(0));
                            users.get(3).setManager(users.get(0));
                            users.get(4).setManager(users.get(3));
                            users.get(5).setManager(users.get(3));
                            users.get(6).setManager(users.get(3));
                            users.get(7).setManager(users.get(3));
                            users.get(8).setManager(users.get(2));
                            users.get(9).setManager(users.get(2));
                            users.get(10).setManager(users.get(1));
                            users.get(11).setManager(users.get(1));
                            users.get(12).setManager(users.get(1));
                            users.get(13).setManager(users.get(6));
                            users.get(14).setManager(users.get(6));
                            users.get(15).setManager(users.get(6));
                            users.get(16).setManager(users.get(11));
                            users.get(17).setManager(users.get(11));
                            users.get(18).setManager(users.get(11));
                            users.get(19).setManager(users.get(11));
                            users.get(20).setManager(users.get(11));
                            users.get(21).setManager(users.get(14));
                            users.get(22).setManager(users.get(14));
                            users.get(23).setManager(users.get(5));
                            users.get(24).setManager(users.get(5));
                            users.get(25).setManager(users.get(5));
                            users.get(26).setManager(users.get(8));
                            users.get(27).setManager(users.get(8));
                            users.get(28).setManager(users.get(9));
                            users.get(29).setManager(users.get(9));

                            List<String> numeManageri = Arrays.asList("Nita Stefan", "Andrei Popescu", "Florin Ionescu", "Mihai Dumitrescu", "Teodor Stefan");

                            ObjectMapper mapperEvaluari = new ObjectMapper();
                            TypeReference<List<String>> typeReferenceEvaluari = new TypeReference<>() {};
                            InputStream inputStreamEvaluari = TypeReference.class.getResourceAsStream("/json/evaluari.json");
                            List<String> evaluari = mapperEvaluari.readValue(inputStreamEvaluari, typeReferenceEvaluari);

                            Random rand = new Random();
                            for (int j = 0; j < users.size(); j++) {
                                if (j == 28 || j == 26) {
                                    j++;
                                }
                                Salary salary = Salary.builder()
                                        .date(createRandomDate(createRandomIntBetween(2010, 2020), 2021))
                                        .base(createRandomIntBetween(3000, 6000) / 10 * 10)
                                        .performanceBonus(rand.nextInt(2000) / 10 * 10)
                                        .projectBonus(rand.nextInt(2000) / 10 * 10)
                                        .mealTickets(rand.nextInt(1000) / 10 * 10)
                                        .lifeInsurance(rand.nextInt(2000) / 10 * 10)
                                        .subscriptions(rand.nextInt(300) / 10 * 10)
                                        .build();
                                users.get(j).addSalary(salary);

                                Evaluation evaluation = Evaluation.builder()
                                        .user_id(j + 1)
                                        .firstNameUser(users.get(j).getFirstName())
                                        .lastNameUser(users.get(j).getLastName())
                                        .evaluationDate(createRandomDate(createRandomIntBetween(2010, 2020), 2021))
                                        .communication(rand.nextFloat(1))
                                        .efficiency(rand.nextFloat(1))
                                        .expertise(rand.nextFloat(1))
                                        .initiative(rand.nextFloat(1))
                                        .leadership(rand.nextFloat(1))
                                        .managerName(numeManageri.get(rand.nextInt(numeManageri.size())))
                                        .feedback(evaluari.get(rand.nextInt(evaluari.size() - 1)))
                                        .build();
                                users.get(j).getEvaluations().add(evaluation);

                                for (int i = 1; i < (5 + rand.nextInt(10)); i++) {
                                    Salary salaryAnterioara = users.get(j).getSalaries().get(i - 1);
                                    Salary newSalary = Salary.builder()
                                            .date(salaryAnterioara.getDate().plusDays(createRandomIntBetween(90, 365)))
                                            .base(salaryAnterioara.getBase() + rand.nextInt(2000) / 10 * 10)
                                            .projectBonus(rand.nextInt(2000) / 10 * 10)
                                            .performanceBonus(rand.nextInt(3000) / 10 * 10)
                                            .mealTickets(salaryAnterioara.getMealTickets() + rand.nextInt(300) / 10 * 10)
                                            .lifeInsurance(salaryAnterioara.getLifeInsurance() + rand.nextInt(400) / 10 * 10)
                                            .subscriptions(salaryAnterioara.getSubscriptions() + rand.nextInt(50) / 10 * 10)
                                            .build();
                                    if (newSalary.getDate().getYear() > 2024) {
                                        newSalary.setDate(newSalary.getDate().minusYears(newSalary.getDate().getYear() - 2024));
                                    }
                                    users.get(j).addSalary(newSalary);

                                    Evaluation previousEvaluation = users.get(j).getEvaluations().get(i - 1);
                                    Evaluation eveluareNoua = Evaluation.builder()
                                            .user_id(j + 1)
                                            .firstNameUser(users.get(j).getFirstName())
                                            .lastNameUser(users.get(j).getLastName())
                                            .evaluationDate(previousEvaluation.getEvaluationDate().plusDays(90))
                                            .communication(rand.nextFloat(1))
                                            .efficiency(rand.nextFloat(1))
                                            .expertise(rand.nextFloat(1))
                                            .initiative(rand.nextFloat(1))
                                            .leadership(rand.nextFloat(1))
                                            .managerName(numeManageri.get(rand.nextInt(numeManageri.size())))
                                            .feedback(evaluari.get(rand.nextInt(evaluari.size() - 1)))
                                            .build();
                                    Collections.sort(users.get(j).getEvaluations());
                                    users.get(j).getEvaluations().add(eveluareNoua);
                                }
                            }

                            userService.save(users);
                            System.out.println(ROBundle.getString("successDatabaseInitialization"));
                        } catch (IOException e) {
                            System.out.println(MessageFormat.format(ROBundle.getString("errorDatabaseInitialization"), e.getMessage()));
                        }
                    } else {
                        //LIGHT
                        ObjectMapper mapper = new ObjectMapper();
                        TypeReference<List<User>> typeReference = new TypeReference<>() {};
                        InputStream inputStream = TypeReference.class.getResourceAsStream("/json/usersLight.json");

                        int avatarCount = new File("src/main/resources/avatars").list().length;
                        String[] avatarsList = new File("src/main/resources/avatars").list();
                        byte[][] avatars = new byte[avatarCount][];

                        for (int i = 0; i < avatarCount; i++) {
                            InputStream is = HrmsApplication.class
                                    .getResourceAsStream("/avatars/" + avatarsList[i]);
                            byte[] bytes = is.readAllBytes();
                            avatars[i] = bytes;
                        }

                        try {
                            List<User> users = mapper.readValue(inputStream, typeReference);
                            for (User user : users) {
                                user.setAvatar(new Avatar("avatar.jpg",
                                        "image/jpg",
                                        avatars[ThreadLocalRandom.current().nextInt(
                                                0, avatarCount - 1)]));
                            }

                            userService.save(users);
                            System.out.println("Users Created!");
                        } catch (IOException e) {
                            System.out.println("Unable to create users: " + e.getMessage());
                        }
                    }
                } else {
                    if(userRepository.count() == 0) {
                        userRepository.save(User.builder()
                                        .email("admin@admin")
                                        .password(passwordEncoder.encode("admin"))
                                        .role(Role.ADMIN)
                                        .firstName("ADMIN")
                                        .lastName("ADMIN")
                                .build());
                        System.out.println(ROBundle.getString("successAdminInitialization"));
                    }
                }
            }
        };
    }
}
