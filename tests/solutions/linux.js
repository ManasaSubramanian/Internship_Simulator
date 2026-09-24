// Reference command sequences for internship 5 (Linux). Test suite only.
module.exports = {
  t1: ['cat /srv/showctl/README', 'mkdir ~/notes', 'whoami > ~/notes/whoami.txt', 'ls /srv/shows/nightly'],
  t2: ['grep -c ERROR /var/log/showctl/show.log', 'grep WARN /var/log/showctl/show.log | wc -l', 'tail -n 3 /var/log/showctl/show.log'],
  t3: ['chmod +x /opt/deploy/deploy.sh', "sed -i 's#/srv/show/#/srv/shows/#' /opt/deploy/deploy.sh", 'cd /opt/deploy && ./deploy.sh'],
  t4: ['mkdir /var/log/showctl/archive', 'mv /var/log/showctl/old/* /var/log/showctl/archive/', 'rm -r /var/log/showctl/old'],
  t5: ['mkdir -p /backup/configs', 'cp /etc/showctl/*.conf /backup/configs/', 'ls -l /backup/configs'],
  t6: ['cut -d, -f2 /srv/data/projectors.csv | sort | uniq -c', 'grep OFFLINE /srv/data/projectors.csv | cut -d, -f1 > ~/offline.txt'],
  t7: ['chmod 600 /etc/showctl/secrets.env', 'chmod 755 /opt/tools/*.sh', 'ls -l /opt/tools'],
  t8: ['grep -c ERROR /var/log/services/*.log', 'echo lighting > ~/noisiest.txt'],
  t9: ['ps', 'kill 777'],
  t10: ['find /srv -name "*.tmp"', 'find /srv -name "*.tmp" -delete'],
  t11: ['df -h', 'ls -lS /var/log/showctl', '> /var/log/showctl/debug.log'],
  t12: ['echo \'echo "ERROR count:"\' > ~/health.sh', "echo 'grep -c ERROR /var/log/showctl/show.log' >> ~/health.sh", 'chmod +x ~/health.sh', '~/health.sh'],
  t13: ['find /srv/shows -name "*.cue" | sort > ~/cue-audit.txt', 'wc -l ~/cue-audit.txt', 'find /srv/shows -name "*.cue" | wc -l'],
  'i-lx1': ['grep -rl cue_offset /etc'],
  'i-lx2': ['grep -c WARN /var/log/showctl/show.log'],
  'i-lx3': ['tail -n 3 /var/log/showctl/show.log > /tmp/report'],
};
