<!--
Sync Impact Report:
- Version change: Template → 1.0.0
- Modified principles: All placeholders replaced with concrete principles
- Added sections: Spec-Driven Development, AI-Native Tooling, API Integration Standards, Security Requirements
- Removed sections: None (all sections filled)
- Templates requiring updates: ✅ All templates align with principles
- Follow-up TODOs: None
-->

# TikTok Creator Insight Assistant Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST start with a complete technical specification document before any code implementation begins. Specifications must be written in `spec.md` format following the GitHub Spec-Kit template structure, or using `.kiro` format if preferred. The specification MUST include:

- User scenarios and acceptance criteria
- Functional requirements (technology-agnostic)
- Success criteria (measurable outcomes)
- Key entities and data models
- Edge cases and error handling

**Rationale**: Specifications serve as the single source of truth, enabling AI-assisted code generation with clear requirements and reducing ambiguity in implementation.

### II. AI-Native Development Tooling (MANDATORY)

All code implementation MUST be performed using AI-assisted development tools. Approved tools include:

- Cursor (primary recommendation)
- Claude Code
- Windsurf
- Other AI-native IDEs with code generation capabilities

**Rationale**: This project demonstrates AI-assisted development workflows. Manual coding without AI assistance violates the project's core methodology.

### III. API Integration Standards

The application MUST integrate with Alibaba Cloud Bailian (阿里云百炼) platform for AI model access. Required specifications:

- API Provider: Alibaba Cloud Bailian Platform
- Recommended Models: DeepSeek-V3, DeepSeek-R1, or Qwen-Max
- API Key Management: MUST use secure environment variables or secret management; NEVER commit API keys to version control
- Error Handling: MUST gracefully handle API rate limits, timeouts, and authentication failures

**Rationale**: Consistent API integration ensures reliable AI-powered features and maintains security best practices.

### IV. MVP-First Approach

Features MUST be implemented incrementally, prioritizing core user value. Each user story MUST be independently testable and deliverable. Follow YAGNI (You Aren't Gonna Need It) principles - avoid over-engineering.

**Rationale**: MVP focus ensures rapid delivery of value while maintaining flexibility for future enhancements.

### V. Code Quality & Testing

- Code MUST be readable, well-structured, and follow language-specific best practices
- Critical user flows MUST have error handling and user-friendly error messages
- API integrations MUST include timeout and retry logic
- Loading states MUST be implemented for all asynchronous operations

**Rationale**: Quality code ensures maintainability and provides good user experience even in error scenarios.

## Technology Constraints

### Required Technologies

- **Frontend**: Modern web framework (React, Vue, or similar) with responsive design
- **Backend**: RESTful API architecture
- **AI Integration**: Alibaba Cloud Bailian API (DeepSeek-V3/R1 or Qwen-Max)
- **State Management**: Appropriate state management solution for chosen frontend framework
- **Styling**: Modern CSS framework or component library for card-based layouts

### Prohibited Practices

- Hardcoded API keys or credentials
- Skipping specification phase before implementation
- Manual coding without AI assistance (except for minor fixes)
- Over-engineering beyond MVP requirements

## Security Requirements

- API keys MUST be stored in environment variables (`.env` files excluded from version control)
- User inputs MUST be sanitized before API calls
- API responses MUST be validated before rendering
- Error messages MUST NOT expose sensitive system information

## Development Workflow

1. **Specification Phase**: Write complete `spec.md` using Spec-Kit templates
2. **Planning Phase**: Create implementation plan based on specification
3. **Task Breakdown**: Generate actionable task list from plan
4. **Implementation Phase**: Use AI-native tools to generate code from specification
5. **Validation Phase**: Test against acceptance criteria and success metrics
6. **Documentation Phase**: Document development process, tool usage, and key corrections

## Deliverable Requirements

Every feature implementation MUST include:

- **Technical Specification**: Complete `spec.md` or `.kiro` file
- **Source Code**: Full frontend and backend implementation
- **Development Report**: Retrospective documenting tools used, development process, and key correction cases
- **Runtime Evidence**: Three screenshots demonstrating:
  1. Specification writing interface
  2. AI code generation process
  3. Final running application

## Governance

This constitution supersedes all other development practices. Amendments require:

- Documentation of rationale for change
- Update to affected templates and documentation
- Version increment following semantic versioning (MAJOR.MINOR.PATCH)

All development work MUST verify compliance with these principles. Complexity beyond MVP scope MUST be justified and documented.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
