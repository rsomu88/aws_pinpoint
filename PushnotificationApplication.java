package com.awsPinPoint.pushnotification;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.awsPinPoint.pushnotification")
public class PushnotificationApplication {

	public static void main(String[] args) {
		SpringApplication.run(PushnotificationApplication.class, args);
		System.out.println("AWS Pinpoint");
	}

}
