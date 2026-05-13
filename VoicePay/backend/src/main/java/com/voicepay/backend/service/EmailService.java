package com.voicepay.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRegistrationEmail(String toEmail, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("your-email@gmail.com"); // Matches properties
            message.setTo(toEmail);
            message.setSubject("Welcome to VoicePay - Registration Successful!");
            message.setText("Hello " + name + ",\n\n" +
                    "Congratulations! You have successfully registered on VoicePay.\n\n" +
                    "Thank you for showing trust in VoicePay. We're excited to have you on board!\n\n" +
                    "Best Regards,\nThe VoicePay Team");

            mailSender.send(message);
        } catch (Exception e) {
            // We catch the error so if SMTP auth fails in demo, user registration doesn't break
            System.err.println("Error sending email (please configure valid SMTP credentials in properties): " + e.getMessage());
        }
    }
}
