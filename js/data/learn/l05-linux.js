// Learning Center: the Linux command line from zero (internship 5).
IS.learnData = IS.learnData || {};
(function () {
  const HOME = '/home/intern';
  const MOTD = 'practice-box (simulated Linux)\nType `help` to list commands, or `man ls` for help on one.';
  const term = (o) => Object.assign({ type: 'terminal', motd: MOTD }, o);
  const lastOut = (sh, re) => sh.history.filter((h) => re.test(h.cmd)).map((h) => h.out).join('\n');
  const LOG = ['09:00 INFO show loaded', '09:05 ERROR projector 2 offline', '09:06 INFO retrying', '09:07 ERROR audio cue 14 missing', '09:10 INFO doors open', '09:12 ERROR fog machine low fluid'].join('\n') + '\n';

  IS.learnData.linux = [
    {
      id: 'navigate', icon: '🧭', title: 'Finding your way: pwd, ls and cd',
      summary: 'The terminal is a text way to use a computer. Learn where you are and how to move around.',
      tags: ['pwd', 'ls', 'cd', 'directory', 'folder', 'path', 'navigate'],
      words: `<p>Servers that run shows, rides and websites usually have no screen or mouse. Engineers control them by typing <b>commands</b> into a <b>terminal</b> (also called the command line or shell). You type a command, press Enter, and the computer prints a response.</p>
        <p>Files live in <b>directories</b> (folders), arranged like a tree. The very top is <code>/</code> (the "root"). A <b>path</b> is the address of a file or folder, like <code>/srv/shows/nightly</code>: start at the root, go into <code>srv</code>, then <code>shows</code>, then <code>nightly</code>.</p>
        <p>You are always "standing" in one directory, the <b>current directory</b>. Three commands get you around:</p>
        <ul><li><code>pwd</code> ("print working directory"): shows where you are.</li>
        <li><code>ls</code> ("list"): shows what's in the current directory. <code>ls /srv</code> lists a different folder.</li>
        <li><code>cd path</code> ("change directory"): moves you. <code>cd ..</code> goes <b>up</b> one level, and <code>cd ~</code> (or just <code>cd</code>) goes to your home folder.</li></ul>
        <p>A path starting with <code>/</code> is <b>absolute</b> (from the root). A path without it is <b>relative</b> to where you are now: from <code>/srv</code>, <code>cd shows</code> takes you to <code>/srv/shows</code>.</p>
        <div class="analogy">🏢 <b>Like a building:</b> <code>pwd</code> is "which room am I in?", <code>ls</code> is looking around the room, and <code>cd</code> is walking through a door. <code>..</code> is always the door back to the hallway.</div>`,
      terms: [['terminal / shell', 'Where you type commands.'], ['directory', 'A folder.'], ['path', 'A file\'s address, like <code>/srv/shows</code>.'], ['~', 'Shortcut for your home folder.'], ['..', 'The folder one level up.']],
      example: {
        lang: 'bash', heading: 'See it in the terminal',
        intro: 'Each line is one command you type, followed by Enter:',
        code: `pwd
ls
cd /srv/shows
ls
cd ..
pwd`,
        output: '/home/intern\nnotes.txt  todo.txt\nnightly  parade\n/srv',
        steps: [
          { lines: [1], text: 'Where am I? It prints <code>/home/intern</code>, your home folder.' },
          { lines: [2], text: 'What\'s here? It lists <code>notes.txt</code> and <code>todo.txt</code>.' },
          { lines: [3], text: 'Walk into <code>/srv/shows</code> using an absolute path. Nothing is printed, and that\'s normal. Silence means success.' },
          { lines: [4], text: 'List this folder: <code>nightly</code> and <code>parade</code>.' },
          { lines: [5, 6], text: '<code>cd ..</code> goes up one level, so <code>pwd</code> now prints <code>/srv</code>.' },
        ],
      },
      practice: [
        term({ id: 'L-lx-where', title: 'Where am I?',
          brief: '<p>Print your current directory, then list the files in it.</p>',
          fs: { files: { [HOME + '/notes.txt']: 'Remember: badge in at 9\n', [HOME + '/todo.txt']: 'Learn the terminal\n' }, cwd: HOME },
          objectives: [
            { text: 'Print the current directory (pwd)', check: (sh) => sh.ranOutput(HOME) },
            { text: 'List the files in your home folder (ls)', check: (sh) => /todo\.txt/.test(lastOut(sh, /^\s*ls\b/)) },
          ],
          hint: 'Type <code>pwd</code> and press Enter. Then type <code>ls</code> and press Enter.',
          solution: ['pwd', 'ls'] }),
        term({ id: 'L-lx-into', title: 'Visit the show folder',
          brief: '<p>Move into <code>/srv/shows/nightly</code> and list the cue files there.</p>',
          fs: { files: { '/srv/shows/nightly/01-opening.cue': 'lights up\n', '/srv/shows/nightly/02-castle.cue': 'fireworks\n', '/srv/shows/parade/float1.cue': 'music\n' }, cwd: HOME },
          objectives: [
            { text: 'Be inside /srv/shows/nightly', check: (sh) => sh.cwd() === '/srv/shows/nightly' },
            { text: 'List the cue files', check: (sh) => /02-castle\.cue/.test(lastOut(sh, /^\s*ls\b/)) },
          ],
          hint: '<code>cd /srv/shows/nightly</code> then <code>ls</code>.',
          solution: ['cd /srv/shows/nightly', 'ls'] }),
        term({ id: 'L-lx-up', title: 'Go up a level',
          brief: '<p>You start in <code>/srv/shows/nightly</code>. Go <b>up</b> one level with <code>cd ..</code>, then list what\'s there.</p>',
          fs: { files: { '/srv/shows/nightly/01-opening.cue': 'lights up\n', '/srv/shows/parade/float1.cue': 'music\n' }, cwd: '/srv/shows/nightly' },
          objectives: [
            { text: 'Use cd .. to reach /srv/shows', check: (sh) => sh.ran(/cd\s+\.\./) && sh.cwd() === '/srv/shows' },
            { text: 'List the folder (you should see nightly and parade)', check: (sh) => /parade/.test(lastOut(sh, /^\s*ls\b/)) },
          ],
          hint: 'Type <code>cd ..</code> (cd, a space, two dots), then <code>ls</code>.',
          solution: ['cd ..', 'ls'] }),
      ],
    },
    {
      id: 'files', icon: '📄', title: 'Working with files: cat, echo, mkdir, cp, mv, rm',
      summary: 'Read, create, copy, rename and delete files from the terminal.',
      tags: ['cat', 'echo', 'mkdir', 'cp', 'mv', 'rm', 'file', 'copy', 'backup'],
      words: `<p>Once you can move around, you need to handle files. Most commands follow the same shape: <b>command</b>, then what it acts on, separated by spaces.</p>
        <ul><li><code>cat file</code>: print a file\'s contents.</li>
        <li><code>echo text</code>: print text. Add <code>&gt; file</code> to <b>save</b> it to a file instead (this replaces what was there). <code>&gt;&gt; file</code> adds to the end.</li>
        <li><code>mkdir name</code>: make a new directory.</li>
        <li><code>cp source destination</code>: copy a file. The original stays.</li>
        <li><code>mv source destination</code>: move a file, or rename it (moving it to a new name in the same folder).</li>
        <li><code>rm file</code>: remove (delete) a file. ⚠️ There is no trash can in the terminal. It\'s gone.</li></ul>
        <div class="analogy">🗃️ <b>Like a filing cabinet:</b> <code>cat</code> reads a sheet, <code>cp</code> photocopies it, <code>mv</code> moves it to another drawer (or relabels it), <code>mkdir</code> adds a new drawer, and <code>rm</code> shreds it.</div>`,
      terms: [['cat', 'Show a file.'], ['>', 'Send output into a file (overwrites).'], ['>>', 'Append output to the end of a file.'], ['cp / mv', 'Copy / move-or-rename.'], ['rm', 'Delete. No undo!']],
      example: {
        lang: 'bash', heading: 'See it in the terminal',
        code: `cat welcome.txt
echo "Doors at 9" > note.txt
mkdir backup
cp note.txt backup/note.txt
mv note.txt reminder.txt
rm reminder.txt`,
        steps: [
          { lines: [1], text: 'Print the contents of <code>welcome.txt</code>.' },
          { lines: [2], text: 'Instead of printing "Doors at 9", <code>&gt;</code> saves it into a new file <code>note.txt</code>.' },
          { lines: [3], text: 'Create a folder named <code>backup</code>.' },
          { lines: [4], text: 'Copy the note into that folder. Now there are two copies.' },
          { lines: [5], text: 'Rename the original to <code>reminder.txt</code>.' },
          { lines: [6], text: 'Delete it. The copy in <code>backup/</code> is still safe.' },
        ],
      },
      practice: [
        term({ id: 'L-lx-cat', title: 'Save your badge code',
          brief: '<p>Read <code>welcome.txt</code> to find your badge code, then save <b>just the code</b> into a new file <code>badge.txt</code>.</p>',
          fs: { files: { [HOME + '/welcome.txt']: 'Welcome to the team!\nYour badge code is 4417\n' }, cwd: HOME },
          objectives: [
            { text: 'Print welcome.txt', check: (sh) => /4417/.test(lastOut(sh, /^\s*cat\b/)) },
            { text: 'badge.txt contains only 4417', check: (sh) => (sh.read(HOME + '/badge.txt') || '').trim() === '4417' },
          ],
          hint: '<code>cat welcome.txt</code>, then <code>echo 4417 &gt; badge.txt</code>.',
          solution: ['cat welcome.txt', 'echo 4417 > badge.txt'] }),
        term({ id: 'L-lx-backup', title: 'Make a backup',
          brief: '<p>Create a folder <code>backup</code> in your home directory and put a <b>copy</b> of <code>show.cue</code> inside it. The original must stay where it is.</p>',
          fs: { files: { [HOME + '/show.cue']: 'CUE 1 lights\nCUE 2 music\n' }, cwd: HOME },
          objectives: [
            { text: 'A backup directory exists', check: (sh) => sh.isDir(HOME + '/backup') },
            { text: 'backup/show.cue is an exact copy', check: (sh) => sh.read(HOME + '/backup/show.cue') === 'CUE 1 lights\nCUE 2 music\n' },
            { text: 'The original show.cue is still there', check: (sh) => sh.isFile(HOME + '/show.cue') },
          ],
          hint: '<code>mkdir backup</code> then <code>cp show.cue backup/show.cue</code>.',
          solution: ['mkdir backup', 'cp show.cue backup/show.cue'] }),
        term({ id: 'L-lx-tidy', title: 'Tidy up',
          brief: '<p>Rename <code>draft.txt</code> to <code>final.txt</code>, and delete the leftover file <code>junk.tmp</code>.</p>',
          fs: { files: { [HOME + '/draft.txt']: 'Parade starts at 3 PM\n', [HOME + '/junk.tmp']: 'temp\n' }, cwd: HOME },
          objectives: [
            { text: 'final.txt exists with the parade text, and draft.txt is gone', check: (sh) => /Parade/.test(sh.read(HOME + '/final.txt') || '') && !sh.exists(HOME + '/draft.txt') },
            { text: 'junk.tmp is deleted', check: (sh) => !sh.exists(HOME + '/junk.tmp') },
          ],
          hint: '<code>mv draft.txt final.txt</code> and <code>rm junk.tmp</code>.',
          solution: ['mv draft.txt final.txt', 'rm junk.tmp'] }),
      ],
    },
    {
      id: 'search', icon: '🔎', title: 'Searching: grep, pipes and wc',
      summary: 'Find the lines you care about in huge log files, and count them.',
      tags: ['grep', 'pipe', 'wc', 'log', 'search', 'count', 'error'],
      words: `<p>Servers write <b>logs</b>: text files with one line per event. They can be thousands of lines long, so you never read them top to bottom. You <b>search</b> them.</p>
        <ul><li><code>grep WORD file</code>: prints only the lines that contain WORD. It\'s case-sensitive: <code>ERROR</code> and <code>error</code> are different. <code>grep -i</code> ignores case.</li>
        <li><code>grep -c WORD file</code>: prints just the <b>count</b> of matching lines.</li>
        <li><code>wc -l file</code>: counts lines in a file ("word count", <code>-l</code> for lines).</li></ul>
        <p>The <b>pipe</b> <code>|</code> connects commands: the output of the left command becomes the input of the right one. <code>grep ERROR show.log | wc -l</code> means "find the error lines, then count them". And <code>&gt; file</code> saves any command\'s output to a file.</p>
        <div class="analogy">🧪 <b>Like a water filter line:</b> the log pours in at the left, <code>grep</code> filters out everything but errors, and <code>wc</code> measures how much came through.</div>`,
      terms: [['log', 'A file of events, one per line.'], ['grep', 'Keep only matching lines.'], ['|', 'Pipe: send one command\'s output into the next.'], ['wc -l', 'Count lines.']],
      example: {
        lang: 'bash', heading: 'See it in the terminal',
        code: `grep ERROR /var/log/show.log
grep -c ERROR /var/log/show.log
grep ERROR /var/log/show.log | wc -l
grep ERROR /var/log/show.log > errors.txt`,
        output: '09:05 ERROR projector 2 offline\n09:07 ERROR audio cue 14 missing\n09:12 ERROR fog machine low fluid\n3\n3',
        steps: [
          { lines: [1], text: 'Show only the three lines containing ERROR. The INFO lines are hidden.' },
          { lines: [2], text: '<code>-c</code> prints just the count: <code>3</code>.' },
          { lines: [3], text: 'Same answer, built with a pipe: grep\'s lines flow into <code>wc -l</code>, which counts them.' },
          { lines: [4], text: 'Save the error lines into <code>errors.txt</code> to share with the team.' },
        ],
      },
      practice: [
        term({ id: 'L-lx-grep', title: 'Show only the errors',
          brief: '<p>Print only the lines of <code>/var/log/show.log</code> that contain <code>ERROR</code>.</p>',
          fs: { files: { '/var/log/show.log': LOG }, cwd: HOME },
          objectives: [{ text: 'Print the ERROR lines (and no INFO lines)', check: (sh) => sh.history.some((h) => /grep/.test(h.cmd) && h.out.includes('fog machine') && h.out.includes('projector 2') && !h.out.includes('INFO')) }],
          hint: '<code>grep ERROR /var/log/show.log</code>',
          solution: ['grep ERROR /var/log/show.log'] }),
        term({ id: 'L-lx-count', title: 'Count the errors',
          brief: '<p>Print <b>how many</b> lines in <code>/var/log/show.log</code> contain <code>ERROR</code>, using grep.</p>',
          fs: { files: { '/var/log/show.log': LOG }, cwd: HOME },
          objectives: [{ text: 'Print the number of ERROR lines', check: (sh) => sh.ran(/grep/) && sh.ranOutput('3') }],
          hint: '<code>grep -c ERROR /var/log/show.log</code>, or pipe into <code>wc -l</code>.',
          solution: ['grep -c ERROR /var/log/show.log'] }),
        term({ id: 'L-lx-save', title: 'Save a report',
          brief: '<p>Save the ERROR lines from <code>/var/log/show.log</code> into a file <code>errors.txt</code> in your home folder.</p>',
          fs: { files: { '/var/log/show.log': LOG }, cwd: HOME },
          objectives: [{ text: '~/errors.txt holds exactly the 3 ERROR lines', check: (sh) => { const c = (sh.read(HOME + '/errors.txt') || '').trim().split('\n'); return c.length === 3 && c.every((l) => l.includes('ERROR')); } }],
          hint: '<code>grep ERROR /var/log/show.log &gt; errors.txt</code>',
          solution: ['grep ERROR /var/log/show.log > errors.txt'] }),
      ],
    },
    {
      id: 'permissions', icon: '🔐', title: 'Permissions and running scripts',
      summary: 'Who may read, change or run a file, and how to run a script.',
      tags: ['chmod', 'permission', 'script', 'execute', 'ls -l', 'mode', 'secret', '600', '755'],
      words: `<p>Every file has <b>permissions</b> that say who may <b>r</b>ead it, <b>w</b>rite (change) it, and e<b>x</b>ecute (run) it. <code>ls -l</code> shows them at the start of each line, like <code>-rwxr-xr-x</code>:</p>
        <ul><li>The first character is <code>-</code> for a file or <code>d</code> for a directory.</li>
        <li>Then three groups of three: the <b>owner</b> (you), the owner\'s <b>group</b>, and <b>everyone else</b>. A letter means allowed; <code>-</code> means not.</li></ul>
        <p>Permissions are also written as three digits, one per group, adding r = 4, w = 2, x = 1. So <code>7</code> = rwx, <code>6</code> = rw-, <code>5</code> = r-x, <code>4</code> = r--, <code>0</code> = nothing. <code>755</code> means "I can do everything; others can read and run". <code>600</code> means "only I can read and write". That\'s perfect for secrets like passwords.</p>
        <p><code>chmod</code> changes permissions: <code>chmod 600 secret.txt</code>, or <code>chmod +x start.sh</code> to add "run" permission.</p>
        <p>A <b>script</b> is a file full of commands. Once it\'s executable, you run it with <code>./start.sh</code>. The <code>./</code> means "the file in this folder".</p>
        <div class="analogy">🔑 <b>Like keys to a room:</b> some people can only look through the window (read), some can rearrange the furniture (write), and some can switch on the machines (execute).</div>`,
      terms: [['ls -l', 'Long listing that shows permissions.'], ['r / w / x', 'Read / write / execute.'], ['chmod', 'Change permissions: <code>chmod 755 file</code> or <code>chmod +x file</code>.'], ['./script.sh', 'Run a script in the current folder.']],
      example: {
        lang: 'bash', heading: 'See it in the terminal',
        code: `ls -l
chmod +x start.sh
./start.sh
chmod 600 secret.txt`,
        output: '-rw-r--r-- 1 intern staff 19 Jun 14 09:00 start.sh\nShow starting',
        steps: [
          { lines: [1], text: '<code>-rw-r--r--</code>: you can read and write, but <b>nobody</b> can run it yet (no x).' },
          { lines: [2], text: 'Add execute permission. Now it reads <code>-rwxr-xr-x</code> (755).' },
          { lines: [3], text: 'Run the script. Its commands print "Show starting".' },
          { lines: [4], text: 'Lock a secret file so only you can read and write it: <code>-rw-------</code>.' },
        ],
      },
      practice: [
        term({ id: 'L-lx-perm', title: 'Look, then allow running',
          brief: '<p>Check the permissions of the files in your home folder with <code>ls -l</code>, then make <code>start.sh</code> executable.</p>',
          fs: { files: { [HOME + '/start.sh']: { content: 'echo Show starting\n', mode: '644' } }, cwd: HOME },
          objectives: [
            { text: 'Show the long listing (ls -l)', check: (sh) => sh.ran(/ls\s+-l/) },
            { text: 'start.sh is executable by you', check: (sh) => (+String(sh.mode(HOME + '/start.sh'))[0] & 1) === 1 },
          ],
          hint: '<code>ls -l</code> then <code>chmod +x start.sh</code>.',
          solution: ['ls -l', 'chmod +x start.sh'] }),
        term({ id: 'L-lx-run', title: 'Run the show script',
          brief: '<p><code>start.sh</code> isn\'t executable yet. Fix that, then run it.</p>',
          fs: { files: { [HOME + '/start.sh']: { content: 'echo Show starting\n', mode: '644' } }, cwd: HOME },
          objectives: [{ text: 'Run ./start.sh and see "Show starting"', check: (sh) => sh.history.some((h) => /\.\/start\.sh/.test(h.cmd) && h.out.includes('Show starting')) }],
          hint: 'Running it first says "Permission denied". Use <code>chmod +x start.sh</code>, then <code>./start.sh</code>.',
          solution: ['chmod +x start.sh', './start.sh'] }),
        term({ id: 'L-lx-secret', title: 'Lock the secret',
          brief: '<p><code>api_key.txt</code> can be read by everyone. Change it so only you can read and write it (mode <code>600</code>).</p>',
          fs: { files: { [HOME + '/api_key.txt']: { content: 'key-7f3a9\n', mode: '644' } }, cwd: HOME },
          objectives: [{ text: 'api_key.txt has mode 600', check: (sh) => sh.mode(HOME + '/api_key.txt') === '600' }],
          hint: '<code>chmod 600 api_key.txt</code>',
          solution: ['chmod 600 api_key.txt'] }),
      ],
    },
  ];
})();
