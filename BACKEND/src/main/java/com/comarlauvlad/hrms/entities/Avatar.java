package com.comarlauvlad.hrms.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Getter;
import org.hibernate.annotations.GenericGenerator;
@Entity
public class Avatar {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    @Getter
    private String name;
    private String type;
    
    @Lob
    private byte[] data;
    public Avatar() {
    }
    public Avatar(String name, String type, byte[] data) {
        this.name = name;
        this.type = type;
        this.data = data;
    }

    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public byte[] getData() {
        return data;
    }
}