# Detect OS
ifeq ($(OS),Windows_NT)
	PYTHON = python
	VENV = venv/Scripts
	RM = rmdir /s /q
	CP = copy
	SEP = \\
else
	PYTHON = python3
	VENV = venv/bin
	RM = rm -rf
	CP = cp
	SEP = /
endif

# Virtual environment executables
VENV_PYTHON = $(VENV)$(SEP)python
VENV_PIP = $(VENV)$(SEP)pip

.PHONY: all venv install clean run

all: venv install

venv:
ifeq ($(OS),Windows_NT)
	$(PYTHON) -m venv venv
	$(VENV)$(SEP)python -m pip install --upgrade pip
else
	$(PYTHON) -m venv venv
	. $(VENV)$(SEP)activate && python -m pip install --upgrade pip
endif

install: venv
ifeq ($(OS),Windows_NT)
	$(VENV_PIP) install -r requirements.txt
else
	. $(VENV)$(SEP)activate && pip install -r requirements.txt
endif

run:
ifeq ($(OS),Windows_NT)
	$(VENV_PYTHON) -m flask run --host=0.0.0.0 --port=3000
else
	. $(VENV)$(SEP)activate && flask run --host=0.0.0.0 --port=3000
endif

clean:
ifeq ($(OS),Windows_NT)
	if exist venv $(RM) venv
	if exist uploads $(RM) uploads
	if exist __pycache__ $(RM) __pycache__
	if exist .pytest_cache $(RM) .pytest_cache
	if exist build $(RM) build
	if exist dist $(RM) dist
	if exist *.egg-info $(RM) *.egg-info
else
	$(RM) venv
	$(RM) uploads
	$(RM) __pycache__
	$(RM) .pytest_cache
	$(RM) build
	$(RM) dist
	$(RM) *.egg-info
endif
	mkdir uploads

test: install
ifeq ($(OS),Windows_NT)
	$(VENV_PYTHON) -m pytest tests/
else
	. $(VENV)$(SEP)activate && python -m pytest tests/
endif

# Development setup
dev-install: install
ifeq ($(OS),Windows_NT)
	$(VENV_PIP) install black flake8 pytest pytest-cov
else
	. $(VENV)$(SEP)activate && pip install black flake8 pytest pytest-cov
endif

# Format code
format:
ifeq ($(OS),Windows_NT)
	$(VENV_PYTHON) -m black .
else
	. $(VENV)$(SEP)activate && black .
endif

# Lint code
lint:
ifeq ($(OS),Windows_NT)
	$(VENV_PYTHON) -m flake8 .
else
	. $(VENV)$(SEP)activate && flake8 .
endif
