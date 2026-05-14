(function (Drupal, once, drupalSettings) {
  'use strict';

  var accountColors = ['#10b981', '#f97316', '#0ea5e9', '#f43f5e'];

  Drupal.behaviors.portfolioCalendar = {
    attach: function (context) {
      once('portfolio-calendar-init', '#github-merged-activity', context).forEach(function (container) {
        initCalendar(container);
      });
    }
  };

  async function initCalendar(container) {
    renderLoading(container);

    try {
      var endpoint = (drupalSettings.portfolioCalendar && drupalSettings.portfolioCalendar.endpoint)
        ? drupalSettings.portfolioCalendar.endpoint
        : '/portfolio-calendar/activity';

      var response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Calendar endpoint request failed.');
      }

      var payload = await response.json();
      if (!payload || !Array.isArray(payload.days)) {
        throw new Error('Calendar payload is invalid.');
      }

      if (!payload.days.length) {
        renderEmpty(container);
        return;
      }

      var users = resolveUsers(payload);
      renderCalendar(container, payload, users);
    }
    catch (error) {
      renderError(container, 'Could not load Development Pulse right now.');
    }
  }

  function resolveUsers(payload) {
    var usernames = [];

    if (payload.meta && Array.isArray(payload.meta.usernames) && payload.meta.usernames.length) {
      usernames = payload.meta.usernames.filter(function (name) {
        return typeof name === 'string' && name.trim() !== '';
      });
    }

    if (!usernames.length) {
      usernames = Object.keys(payload.days[0].accounts || {});
    }

    return usernames.map(function (username, index) {
      return {
        username: username,
        label: username,
        color: accountColors[index % accountColors.length]
      };
    });
  }

  function renderCalendar(container, payload, userList) {
    var sortedDays = payload.days.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

    var totalContributions = sortedDays.reduce(function (sum, day) {
      return sum + Number(day.total || 0);
    }, 0);

    var activeDays = sortedDays.filter(function (day) {
      return Number(day.total || 0) > 0;
    }).length;

    var header = document.createElement('div');
    header.className = 'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6';

    var sourceLabel = getSourceLabel(payload);
    var generatedLabel = formatGeneratedAt(payload.meta && payload.meta.generatedAt);
    header.innerHTML = '<div>'
      + '<p class="text-sm text-gray-500 dark:text-gray-400">' + totalContributions + ' contributions across ' + activeDays + ' active days</p>'
      + '<p class="text-xs text-gray-400 dark:text-gray-500">Last updated: ' + generatedLabel + '</p>'
      + '<p class="text-xs text-gray-400 dark:text-gray-500">' + sourceLabel + '</p>'
      + '</div>';

    var notices = document.createElement('div');
    notices.className = 'space-y-2 mb-4';

    var fallbackNotice = getFallbackNotice(payload);
    if (fallbackNotice) {
      var fallbackLine = document.createElement('p');
      fallbackLine.className = 'text-xs text-orange-600 dark:text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2';
      fallbackLine.textContent = fallbackNotice;
      notices.appendChild(fallbackLine);
    }

    if (payload.meta && Array.isArray(payload.meta.warnings)) {
      payload.meta.warnings.forEach(function (warningText) {
        var warningLine = document.createElement('p');
        warningLine.className = 'text-xs text-orange-600 dark:text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2';
        warningLine.textContent = warningText;
        notices.appendChild(warningLine);
      });
    }

    if (payload.meta && Array.isArray(payload.meta.errors)) {
      payload.meta.errors.forEach(function (errorText) {
        var errorLine = document.createElement('p');
        errorLine.className = 'text-xs text-red-600 dark:text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2';
        errorLine.textContent = errorText;
        notices.appendChild(errorLine);
      });
    }

    var grid = document.createElement('div');
    grid.className = 'github-grid';

    sortedDays.forEach(function (day) {
      var square = document.createElement('div');
      square.className = 'github-day';

      var activeUsers = userList.filter(function (user) {
        return Number(day.accounts[user.username] || 0) > 0;
      });

      if (activeUsers.length >= 2) {
        square.classList.add('account-both');
        square.style.setProperty('--account-a', activeUsers[0].color);
        square.style.setProperty('--account-b', activeUsers[1].color);
      }
      else if (activeUsers.length === 1) {
        square.classList.add('account-a');
        square.style.backgroundColor = activeUsers[0].color;
      }
      else {
        square.classList.add('level-0');
      }

      square.title = buildTooltip(day, userList);
      grid.appendChild(square);
    });

    var legend = document.createElement('div');
    legend.className = 'github-legend';

    userList.forEach(function (user) {
      var item = document.createElement('div');
      item.className = 'legend-item';

      var swatch = document.createElement('span');
      swatch.className = 'legend-swatch';
      swatch.style.backgroundColor = user.color;

      var label = document.createElement('span');
      label.textContent = user.label;

      item.appendChild(swatch);
      item.appendChild(label);
      legend.appendChild(item);
    });

    if (userList.length >= 2) {
      var bothItem = document.createElement('div');
      bothItem.className = 'legend-item';

      var bothSwatch = document.createElement('span');
      bothSwatch.className = 'legend-swatch';
      bothSwatch.style.background = 'linear-gradient(135deg, ' + userList[0].color + ' 0 50%, ' + userList[1].color + ' 50% 100%)';

      var bothLabel = document.createElement('span');
      bothLabel.textContent = 'Both accounts';

      bothItem.appendChild(bothSwatch);
      bothItem.appendChild(bothLabel);
      legend.appendChild(bothItem);
    }

    var noneItem = document.createElement('div');
    noneItem.className = 'legend-item';

    var noneSwatch = document.createElement('span');
    noneSwatch.className = 'legend-swatch legend-none';

    var noneLabel = document.createElement('span');
    noneLabel.textContent = 'No activity';

    noneItem.appendChild(noneSwatch);
    noneItem.appendChild(noneLabel);
    legend.appendChild(noneItem);

    container.innerHTML = '';
    container.appendChild(header);
    if (notices.childNodes.length > 0) {
      container.appendChild(notices);
    }
    container.appendChild(grid);
    container.appendChild(legend);
  }

  function renderLoading(container) {
    container.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">Loading activity data...</p>';
  }

  function renderEmpty(container) {
    container.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400">No contribution activity found for the selected period.</p>';
  }

  function renderError(container, message) {
    container.innerHTML = '<p class="text-sm text-red-600 dark:text-red-300">' + message + '</p>';
  }

  function buildTooltip(day, userList) {
    var lines = [day.date + ': ' + day.total + ' total contribution' + (day.total === 1 ? '' : 's')];

    userList.forEach(function (user) {
      lines.push(user.label + ': ' + (day.accounts[user.username] || 0));
    });

    return lines.join('\n');
  }

  function formatGeneratedAt(generatedAt) {
    if (!generatedAt) {
      return 'unknown';
    }

    var parsedDate = new Date(generatedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'unknown';
    }

    return parsedDate.toLocaleString();
  }

  function getSourceLabel(payload) {
    var source = (payload.meta && payload.meta.source) ? payload.meta.source : '';

    if (source.indexOf('github-graphql') === 0) {
      return 'Generated from GitHub APIs during runtime.';
    }

    if (source.indexOf('public-fallback') !== -1) {
      return 'Generated from public fallback contribution source.';
    }

    return 'Generated from contribution API data.';
  }

  function getFallbackNotice(payload) {
    var source = (payload.meta && payload.meta.source) ? payload.meta.source : '';
    var usedFallback = (source.indexOf('public-fallback') !== -1) || (payload.meta && payload.meta.publicFallbackUsed);

    if (!usedFallback) {
      return '';
    }

    return 'Using public fallback contribution data. Private contribution counts may be missing.';
  }
})(Drupal, once, drupalSettings);
