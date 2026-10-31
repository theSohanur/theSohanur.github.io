'use strict';

// Renders the whole page from assets/data/site.json.
//
// Add a job, a role, a degree, a project or a skill by editing that file only —
// nothing here or in index.html needs touching. Employment dates are "YYYY-MM"
// (or "present"), and every range and duration is worked out from them, so the
// current role keeps counting on its own.
//
// This fetches a file, so it needs to be served over http. On GitHub Pages that
// is automatic; locally run `python -m http.server` rather than opening
// index.html straight off disk.

(function () {
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // ---- dates -----------------------------------------------------------
    // "YYYY-MM" -> months since year 0, so a span is plain subtraction.
    function toMonths(value) {
        if (!value) return null;
        if (value === 'present') {
            var now = new Date();
            return now.getFullYear() * 12 + now.getMonth();
        }
        var parts = String(value).split('-');
        var y = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10);
        if (isNaN(y) || isNaN(m)) return null;
        return y * 12 + (m - 1);
    }

    function monthLabel(value) {
        if (value === 'present') return 'Present';
        var m = toMonths(value);
        return m === null ? '' : MONTHS[m % 12] + ' ' + Math.floor(m / 12);
    }

    function duration(start, end) {
        var a = toMonths(start);
        var b = toMonths(end);
        if (a === null || b === null) return '';
        var total = Math.max(1, b - a + 1);   // both months count, as on a CV
        var years = Math.floor(total / 12);
        var months = total % 12;
        var out = [];
        if (years) out.push(years + (years === 1 ? ' yr' : ' yrs'));
        if (months) out.push(months + (months === 1 ? ' mo' : ' mos'));
        return out.join(' ') || '1 mo';
    }

    // ---- helpers ---------------------------------------------------------
    // Text from the data file is trusted content the owner wrote, and a few
    // fields intentionally carry <b>/<i>. Anything that takes a URL is still
    // checked, so a stray value cannot turn into a javascript: link.
    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function safeUrl(value) {
        var url = String(value == null ? '' : value).trim();
        return /^(https?:|mailto:|tel:|#|\/|[\w./-]+$)/i.test(url) ? esc(url) : '#';
    }

    function el(id) { return document.getElementById(id); }

    function fill(id, html) {
        var node = el(id);
        if (node) node.innerHTML = html;
    }

    function list(items, fn) {
        return (items || []).map(fn).join('');
    }

    // ---- sections --------------------------------------------------------
    function renderProfile(p) {
        if (!p) return;
        var img = el('profile-photo');
        if (img && p.photo) {
            img.src = safeUrl(p.photo);
            img.alt = esc(p.name);
        }
        fill('profile-name', esc(p.name));
        fill('profile-headline',
            esc(p.headline) +
            (p.subheadline ? '<span class="personal-profile__sub">' + esc(p.subheadline) + '</span>' : ''));

        fill('profile-contacts', list(p.contacts, function (c) {
            var value = c.href
                ? '<a href="' + safeUrl(c.href) + '">' + esc(c.value) + '</a>'
                : esc(c.value);
            return '<dt>' + esc(c.label) + ':</dt><dd>' + value + '</dd>';
        }));

        fill('profile-social', list(p.social, function (s) {
            return '<a href="' + safeUrl(s.url) + '" target="_blank" rel="noopener"' +
                   ' aria-label="' + esc(s.label) + '"><i class="fa ' + esc(s.icon) + '"></i></a>';
        }));

        var cv = el('cv-link');
        if (cv && p.cv) cv.href = encodeURI(p.cv);
    }

    function renderEmployment(jobs) {
        fill('employment-list', list(jobs, function (job) {
            var roles = job.roles || [];
            if (!roles.length) return '';

            var start = job.start || roles[roles.length - 1].start;
            var end = roles[0].end;

            return '' +
            '<div class="resume-list__block job">' +
                '<p class="resume-list__block-title">' + esc(job.company) + '</p>' +
                '<p class="resume-list__block-date job__span">' +
                    '<span class="job__range">' + monthLabel(start) + ' - ' + monthLabel(end) + '</span>' +
                    '<span class="job__total">' + duration(start, end) + '</span>' +
                '</p>' +
                '<ul class="job__roles">' + list(roles, function (r) {
                    return '' +
                    '<li class="job__role">' +
                        '<p class="job__role-title">' + esc(r.title) +
                            (r.tag ? '<span class="job__role-tag">' + esc(r.tag) + '</span>' : '') +
                        '</p>' +
                        '<p class="job__role-date">' + monthLabel(r.start) + ' - ' + monthLabel(r.end) +
                            '  &middot;  ' + duration(r.start, r.end) + '</p>' +
                        (r.text ? '<p class="job__role-text">' + r.text + '</p>' : '') +
                    '</li>';
                }) + '</ul>' +
            '</div>';
        }));
    }

    function renderEducation(entries) {
        fill('education-list', list(entries, function (e) {
            return '' +
            '<div class="resume-list__block">' +
                '<p class="resume-list__block-title">' + esc(e.institution) + '</p>' +
                '<p class="resume-list__block-date">' + esc(e.qualification) + '</p>' +
                (e.text ? '<p>' + e.text + '</p>' : '') +
                (e.subjects && e.subjects.length
                    ? '<ul class="skill-tags edu-subjects">' + list(e.subjects, function (s) {
                          return '<li>' + esc(s) + '</li>';
                      }) + '</ul>'
                    : '') +
            '</div>';
        }));
    }

    function renderSkills(groups) {
        fill('skills-list', list(groups, function (g) {
            return '' +
            '<div class="col-md-12 skill-group">' +
                '<div class="row">' +
                    '<div class="col-md-3"><p class="skill-group__label">' + esc(g.group) + '</p></div>' +
                    '<div class="col-md-9"><ul class="skill-tags">' +
                        list(g.items, function (i) { return '<li>' + esc(i) + '</li>'; }) +
                    '</ul></div>' +
                '</div>' +
            '</div>';
        }));
    }

    function renderProjects(data) {
        fill('portfolio-filters', list(data.projectFilters, function (f) {
            return '<li><a href="" data-portfolio-target-tag="' + esc(f.tag) + '">' + f.label + '</a></li>';
        }));

        fill('portfolio-cards', list(data.projects, function (p) {
            return '' +
            '<div class="row project-card" data-portfolio-tag="' + esc(p.tag) + '">' +
                '<div class="col-md-6 col-lg-5 project-card__img">' +
                    '<img src="' + safeUrl(p.image) + '" alt="" loading="lazy" />' +
                '</div>' +
                '<div class="col-md-6 col-lg-7 project-card__info">' +
                    '<h3 class="project-card__title">' + esc(p.title) + '</h3>' +
                    '<p class="project-card__description">' + p.text + '</p>' +
                    (p.stack && p.stack.length
                        ? '<p class="project-card__stack">Used stack:</p><ul class="tags">' +
                          list(p.stack, function (s) { return '<li>' + esc(s) + '</li>'; }) + '</ul>'
                        : '') +
                    (p.link
                        ? '<a href="' + safeUrl(p.link.url) + '" target="_blank" rel="noopener"' +
                          ' class="project-card__link">' + esc(p.link.label) + ' &gt;&gt;</a>'
                        : '') +
                '</div>' +
            '</div>';
        }));

        fill('practice-list', list(data.practice, function (p) {
            return '' +
            '<div class="practice-item">' +
                '<p class="practice-item__title">' + esc(p.title) + '</p>' +
                '<p class="practice-item__description">' + esc(p.text) + '</p>' +
                '<p class="practice-item__links">' + list(p.links, function (l) {
                    return '<a href="' + safeUrl(l.url) + '" target="_blank" rel="noopener">' +
                           esc(l.label) + ' &gt;&gt;</a>';
                }) + '</p>' +
            '</div>';
        }));
    }

    function renderEntries(id, entries) {
        fill(id, list(entries, function (e) {
            return '' +
            '<div class="resume-list__block">' +
                '<p class="resume-list__block-title">' + esc(e.title) + '</p>' +
                (e.meta ? '<p class="resume-list__block-date">' + esc(e.meta) + '</p>' : '') +
                (e.text || e.link
                    ? '<p>' + (e.text ? e.text + ' ' : '') +
                      (e.link
                        ? '<a href="' + safeUrl(e.link.url) + '" target="_blank" rel="noopener">' +
                          esc(e.link.label) + ' &gt;&gt;</a>'
                        : '') + '</p>'
                    : '') +
            '</div>';
        }));
    }

    function renderContact(entries, social) {
        fill('contact-list', list(entries, function (c) {
            var value = c.href
                ? '<a href="' + safeUrl(c.href) + '">' + esc(c.value) + '</a>'
                : esc(c.value);
            return '<dt>' + esc(c.label) + ':</dt><dd>' + value + '</dd>';
        }));

        fill('contact-social', list(social, function (s) {
            return '<li><a href="' + safeUrl(s.url) + '" target="_blank" rel="noopener">' +
                   '<i class="fa ' + esc(s.icon) + ' px-2"></i>' + esc(s.label) + '</a></li>';
        }));
    }

    // ---- links ------------------------------------------------------------
    // Anything pointing off this site opens in its own tab, so a visitor never
    // loses the page. Same-site anchors, mail and phone links are left alone.
    function openExternalLinksInNewTab() {
        var links = document.querySelectorAll('a[href]');
        Array.prototype.forEach.call(links, function (a) {
            var href = a.getAttribute('href') || '';
            if (!/^https?:\/\//i.test(href)) return;      // #anchor, mailto:, tel:, relative
            if (a.hostname === window.location.hostname) return;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });
    }

    // ---- read more --------------------------------------------------------
    // The intro paragraphs run long on a phone and push the rest of the page
    // down, so on narrow screens they collapse behind a toggle.
    var CLAMP_AT = 767;

    function setupReadMore(ids) {
        ids.forEach(function (id) {
            var node = el(id);
            if (!node || node.getAttribute('data-readmore')) return;
            node.setAttribute('data-readmore', 'true');
            node.classList.add('readmore');

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'readmore__toggle';
            btn.setAttribute('aria-controls', id);
            node.parentNode.insertBefore(btn, node.nextSibling);

            function collapse() {
                node.classList.add('is-clamped');
                btn.textContent = 'Show more';
                btn.setAttribute('aria-expanded', 'false');
            }
            function expand() {
                node.classList.remove('is-clamped');
                btn.textContent = 'Show less';
                btn.setAttribute('aria-expanded', 'true');
            }
            btn.addEventListener('click', function () {
                if (node.classList.contains('is-clamped')) expand();
                else collapse();
            });

            function apply() {
                if (window.innerWidth > CLAMP_AT) {
                    node.classList.remove('is-clamped');
                    btn.style.display = 'none';
                    return;
                }
                // Only worth a toggle if the text actually overflows the clamp.
                node.classList.remove('is-clamped');
                var full = node.scrollHeight;
                node.classList.add('is-clamped');
                var clamped = node.clientHeight;
                if (full > clamped + 8) {
                    btn.style.display = '';
                    collapse();
                } else {
                    node.classList.remove('is-clamped');
                    btn.style.display = 'none';
                }
            }

            apply();
            var timer;
            window.addEventListener('resize', function () {
                clearTimeout(timer);
                timer = setTimeout(apply, 150);
            });
        });
    }

    function render(data) {
        renderProfile(data.profile);

        fill('hello-intro', list(data.hello, function (p) { return '<p>' + p + '</p>'; }));
        fill('resume-intro', data.resumeIntro || '');
        fill('projects-intro', data.projectsIntro || '');
        fill('practice-intro', data.practiceIntro || '');
        fill('publications-intro', data.publicationsIntro || '');

        renderEmployment(data.employment);
        renderEducation(data.education);
        renderSkills(data.skills);
        renderProjects(data);
        renderEntries('publications-list', data.publications);
        renderEntries('certifications-list', data.certifications);
        renderContact(data.contact, (data.profile || {}).social);

        openExternalLinksInNewTab();
        setupReadMore(['hello-intro', 'resume-intro']);

        // Let anything waiting on real content run now that it exists.
        document.dispatchEvent(new CustomEvent('site:rendered'));
    }

    // Shown in the page itself when the content cannot be fetched. Opening the
    // file straight off disk is the usual cause: browsers block fetch() on
    // file:// for security, so the JSON never arrives and every section stays
    // empty. A blank page gives no clue, so say what happened and what to do.
    function showLoadFailure(err) {
        var fromDisk = location.protocol === 'file:';
        var host = el('hello-intro') || document.querySelector('main') || document.body;
        var box = document.createElement('div');
        box.className = 'load-failure';
        box.innerHTML =
            '<p class="load-failure__title">The page content could not be loaded.</p>' +
            (fromDisk
                ? '<p>This file was opened straight from disk, and browsers block a ' +
                  'page on <code>file://</code> from reading another local file. ' +
                  'All the content lives in <code>assets/data/site.json</code>, so ' +
                  'nothing can be rendered.</p>' +
                  '<p>Serve the folder over http instead — from this directory run' +
                  '<br><code>python -m http.server 8000</code><br>' +
                  'then open <code>http://localhost:8000</code>. In VS Code, the ' +
                  'Live Server extension does the same thing.</p>'
                : '<p><code>assets/data/site.json</code> did not load (' +
                  esc(err && err.message ? err.message : String(err)) +
                  '). Check that the file exists and is valid JSON.</p>');
        host.insertBefore(box, host.firstChild);
    }

    function boot() {
        // Independent of the data file, so the footer is right even if it fails.
        var year = el('footer-year');
        if (year) year.textContent = new Date().getFullYear();

        fetch('assets/data/site.json', { cache: 'no-cache' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(render)
            .catch(function (err) {
                console.error('Could not load assets/data/site.json —', err);
                if (location.protocol === 'file:') {
                    console.error('Opening index.html from disk blocks the fetch. ' +
                                  'Run `python -m http.server` and use http://localhost:8000 instead.');
                }
                // Without this the page is simply blank, which gives no clue why.
                showLoadFailure(err);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
