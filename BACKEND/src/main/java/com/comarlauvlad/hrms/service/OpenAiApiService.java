package com.comarlauvlad.hrms.service;

import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.ResourceBundle;

@Service
@RequiredArgsConstructor
public class OpenAiApiService {
    private static ResourceBundle ROBundle = ResourceBundle.getBundle("strings");

    @Value("${app.openAiApiKey}")
    private String openAiApiKey;

    private JSONObject promptBuilder(String prompt) {
        JSONObject content1 = new JSONObject()
                .put("type", "text")
                .put("text", prompt);
        ArrayList<JSONObject> content1array = new ArrayList<>();
        content1array.add(content1);
        JSONObject message = new JSONObject()
                .put("role", "system")
                .put("content", content1array);
        return message;
    }

    private ArrayList<JSONObject> messagesBuilder(int communication, int efficiency, int expertise, int initiative, int leadership) {
        ArrayList<JSONObject> messages = new ArrayList<>();
        messages.add(promptBuilder(ROBundle.getString("openAIRequestEvaluationFeedback")));
        messages.add(promptBuilder(
                String.format(ROBundle.getString("openAIRequestEvaluationFeedback2"),
                communication, efficiency, expertise, initiative, leadership)));
        return messages;
    }

    public String requestOpenAiAPI(int communication, int efficiency, int expertise, int initiative, int leadership) {
        final String url = "https://api.openai.com/v1/chat/completions";
        RestTemplate restTemplate = new RestTemplate();
        ArrayList<JSONObject> messages = messagesBuilder(communication, efficiency, expertise, initiative, leadership);
        String body = new JSONObject()
                .put("model", "gpt-4o")
                .put("messages", messages)
                .put("temperature", 1)
                .put("max_tokens", 256)
                .put("top_p", 1)
                .put("frequency_penalty", 0)
                .put("presence_penalty", 0)
                .toString();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class);

        return response.getBody();
    }
}
