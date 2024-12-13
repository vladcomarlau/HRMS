package com.comarlauvlad.hrms.adnotations;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonSerialize(converter = ToLowerCaseConverter.class)
@JsonDeserialize(converter = ToLowerCaseConverter.class)
public @interface ToLowerCase {}