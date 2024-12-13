package com.comarlauvlad.hrms.service;

import com.comarlauvlad.hrms.dao.request.PublicHolidayRequest;
import com.comarlauvlad.hrms.entities.PublicHoliday;
import com.comarlauvlad.hrms.repository.PublicHolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicHolidayService {
    @Autowired
    private final PublicHolidayRepository publicHolidayRepository;

    public List<PublicHoliday> getAllPublicHolidays() {
        return publicHolidayRepository.findAll();
    }

    public PublicHoliday getPublicHolidayById(LocalDate id) {
        return publicHolidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException());
    }

    public void save(PublicHolidayRequest request) {
        if(request != null
        && (request.getBeginDate().isEqual(request.getEndDate())
        || request.getBeginDate().isBefore(request.getEndDate()))) {
            if(publicHolidayRepository.findById(request.getBeginDate()).isPresent()) {
                throw new RuntimeException();
            }
            publicHolidayRepository.save(new PublicHoliday(request));
        } else {
            throw new RuntimeException();
        }
    }

    public void delete(LocalDate id) {
        PublicHoliday publicHoliday = publicHolidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException());
        if(publicHoliday != null) {
            publicHolidayRepository.delete(publicHoliday);
        };
    }
}
