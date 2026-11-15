package dev.aether.api.security;
import jakarta.persistence.Column;import jakarta.persistence.Entity;import jakarta.persistence.GeneratedValue;import jakarta.persistence.GenerationType;import jakarta.persistence.Id;import jakarta.persistence.Table;
@Entity @Table(name="roles") public class AccountRole { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true,length=40) private String name; protected AccountRole(){} public String getName(){return name;} }
