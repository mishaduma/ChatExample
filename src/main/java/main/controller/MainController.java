package main.controller;

import main.model.User;
import main.model.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

@Controller
public class MainController {

    @Autowired
    private UserRepository userRepository;

    @RequestMapping("/")
    public String index(HttpServletRequest request, Model model) {
        String username = (String) request.getSession().getAttribute("username");

        if (username == null || username.isEmpty()) {
            return "redirect:/login";
        }
        model.addAttribute("username", username);

        return "chat";
    }

    @GetMapping(path = "/login")
    public String showLoginPage() {
        return "login";
    }

    @PostMapping(path = "/login")
    public String doLogin(HttpServletRequest request, @RequestParam(defaultValue = "") String username) {
        username = username.trim();

        if (username.isEmpty()) {
            return "login";
        }
        request.getSession().setAttribute("username", username);

        User user = new User();
        user.setName(username);
        user.setSessionId(request.getSession().getId());
        userRepository.save(user);

        return "redirect:/";
    }

    @RequestMapping(path = "/logout")
    public String logout(HttpServletRequest request) {

        Optional<User> userOpt = userRepository.findBySessionId(request.getSession().getId());
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
        }

        request.getSession(true).invalidate();

        return "redirect:/login";
    }
}
