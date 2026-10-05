package com.example.lifedrop.controller;

import com.example.lifedrop.model.BloodCamp;
import com.example.lifedrop.repository.BloodCampRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/camps")
public class CampController {

    @Autowired
    private BloodCampRepository bloodCampRepository;

    @GetMapping
    public List<BloodCamp> getAllCamps() {
        return bloodCampRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createCamp(@RequestBody BloodCamp camp) {
        BloodCamp savedCamp = bloodCampRepository.save(camp);
        return ResponseEntity.ok(savedCamp);
    }
}
