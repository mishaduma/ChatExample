package main.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import main.model.Message;
import main.model.MessageRepository;
import main.model.User;
import main.model.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UsersAndMessagesController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MessageRepository messageRepository;

    ObjectMapper mapper = new ObjectMapper();

    @GetMapping(path = "/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @GetMapping(path = "/messages")
    public List<Message> listMessages() {
        return messageRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Message::getId).reversed())
                .limit(5).collect(Collectors.toList());
    }
}
