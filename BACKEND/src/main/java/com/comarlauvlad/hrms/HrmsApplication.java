package com.comarlauvlad.hrms;

import com.comarlauvlad.hrms.service.OpenAiApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

@SpringBootApplication
public class HrmsApplication {
	public static void main(String[] args) {
		SpringApplication.run(HrmsApplication.class, args);
	}
}
