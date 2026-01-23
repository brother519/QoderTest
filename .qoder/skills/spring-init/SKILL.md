---
name: spring-init
description: "Initialize a new Spring Boot project. Use when: (1) User wants to create a new Java Spring project, (2) User asks to initialize or scaffold a Spring Boot application, (3) User needs to set up a new backend Java project, (4) User mentions 'spring init', 'new spring project', 'init project', 'aaa', or 'create spring app'."
---

# Spring Boot Project Initializer

## Overview

This skill creates a new empty Spring Boot project in the sibling directory of the current project.

## Workflow

### Step 1: Gather Project Information

Ask the user for the following details (with sensible defaults):

| Parameter | Default | Description |
|-----------|---------|-------------|
| Project Name | `demo` | The project directory name |
| Group ID | `com.example` | Maven group identifier |
| Artifact ID | `demo` | Maven artifact identifier |
| Java Version | `17` | Java version (17, 21) |
| Spring Boot Version | `latest stable` | Spring Boot version (optional) |
| Dependencies | `web` | Comma-separated list of dependencies |

### Step 2: Generate Project

Use the Spring Initializr API to generate the project:

```bash
# Execute the init script
python3 scripts/init_spring.py \
  --name <project-name> \
  --group <group-id> \
  --artifact <artifact-id> \
  --java <java-version> \
  --boot-version <spring-boot-version> \
  --dependencies <deps> \
  --output-dir <parent-directory>
```

Or use curl directly:

```bash
curl -G https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.4.1 \
  -d groupId=com.example \
  -d artifactId=demo \
  -d name=demo \
  -d javaVersion=17 \
  -d dependencies=web \
  -o /path/to/sibling/demo.zip

# Extract the project
unzip demo.zip -d /path/to/sibling/demo
rm demo.zip
```

### Step 3: Project Structure

The generated project will have this structure:

```
<project-name>/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/<artifact>/
│   │   │       └── DemoApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
│           └── com/example/<artifact>/
│               └── DemoApplicationTests.java
├── .gitignore
└── mvnw / mvnw.cmd
```

### Step 4: Post-Creation Setup

After creation, provide the user with:

1. Project location path
2. How to run the application: `./mvnw spring-boot:run`
3. How to build: `./mvnw clean package`
4. Default port: 8080

## Common Dependencies

| Dependency | Description |
|------------|-------------|
| `web` | Spring Web (MVC, REST) |
| `data-jpa` | Spring Data JPA |
| `mysql` | MySQL Driver |
| `postgresql` | PostgreSQL Driver |
| `security` | Spring Security |
| `lombok` | Lombok annotations |
| `validation` | Bean Validation |
| `actuator` | Spring Boot Actuator |

## Example Usage

**User**: "Create a new Spring project"

**Response Flow**:
1. Ask for project name and optional customizations
2. Determine the sibling directory path
3. Generate project using Spring Initializr
4. Extract and set up the project
5. Report success with next steps

## Notes

- The project is created in the parent directory of the current workspace
- Requires internet connection to access Spring Initializr
- Maven wrapper is included for running without Maven installed
