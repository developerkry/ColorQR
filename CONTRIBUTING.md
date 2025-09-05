# Contributing to ColorQR

Thank you for your interest in contributing to ColorQR! We welcome contributions from the community.

## How to Contribute

### 🐛 Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include details**: browser version, steps to reproduce, expected vs actual behavior
4. **Add screenshots** if applicable

### 💡 Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity**

### 🔧 Code Contributions

1. **Fork the repository** and create a feature branch
2. **Follow the coding style** (ESLint configuration provided)
3. **Test your changes** thoroughly in multiple browsers
4. **Write clear commit messages**
5. **Submit a pull request** with a detailed description

## Development Setup

```bash
# Fork and clone
git clone https://github.com/developerkry/ColorQR.git
cd ColorQR

# Create feature branch
git checkout -b feature/your-feature-name

# Test locally
python -m http.server 8080
# Open http://localhost:8080

# Make your changes
# Test in multiple browsers

# Commit and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features
- Prefer `const` and `let` over `var`
- Use meaningful variable names
- Add comments for complex algorithms
- Keep functions focused and small

### CSS
- Use CSS custom properties (variables)
- Follow mobile-first responsive design
- Use semantic class names
- Group related styles together

### HTML
- Use semantic HTML elements
- Include proper accessibility attributes
- Maintain clean indentation
- Add helpful comments

## Testing

Since this is a client-side application, please test:

1. **Functionality** - All features work as expected
2. **Browser compatibility** - Chrome, Firefox, Safari, Edge
3. **Mobile responsiveness** - Test on various screen sizes
4. **Accessibility** - Keyboard navigation, screen readers
5. **Performance** - Large files, edge cases

## Pull Request Process

1. **Ensure your code follows the style guidelines**
2. **Test thoroughly** across different browsers and devices
3. **Update documentation** if needed
4. **Link to related issues** in your PR description
5. **Be responsive** to feedback during code review

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone.

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on what's best** for the community

### Enforcement

Unacceptable behavior may result in temporary or permanent removal from the project.

## Questions?

Feel free to open a discussion or reach out to the maintainers if you have any questions about contributing.

Thank you for helping make ColorQR better! 🎉
