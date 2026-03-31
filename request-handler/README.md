# Testing Locally

Since you are likely testing on localhost, standard browsers don't always play nice with subdomains on localhost. Here is how to test it:

The `Etc/Hosts` Trick:
Edit your `/etc/hosts` file (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows) and add:

`127.0.0.1 2cgdq.localhost`

The Browser Test:
Now, go to your browser and visit [http://2cgdq.localhost:3000](http://2cgdq.localhost:3000). Your proxy will see 2cgdq and fetch your built files!
