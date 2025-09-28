# Contributing to MySlide

Thank you for your interest in contributing to MySlide! We welcome contributions from everyone.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally: `git clone https://github.com/your-username/MySlides.git`
3. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
4. Make your changes and test them
5. Commit your changes: `git commit -m "Add your commit message"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request on GitHub

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

### Building

```bash
npx electron-packager . MySlide --platform=win32 --arch=x64 --icon=icon.ico --overwrite --ignore=data.json
```

## Code Style

- Use consistent indentation (2 spaces)
- Follow JavaScript naming conventions
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Test your changes thoroughly
- Ensure the application builds successfully
- Test on the target platform (Windows)

## Commit Messages

Use clear, descriptive commit messages. Examples:
- `feat: add canvas drawing functionality`
- `fix: resolve text input issue in Electron`
- `docs: update README with installation instructions`

## Reporting Issues

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

## Questions?

If you have questions about contributing, feel free to open an issue or contact the maintainers.