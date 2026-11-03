<?php
// Copy to /home/jntsuppl/jnt-form-config.php on the server (OUTSIDE public_html)
// and fill in the real values. Never upload this file into public_html.
return [
    'site_name' => 'www.jntsuppliers.com',
    'to' => 'janaka808@gmail.com',
    // Must be an address on the client's domain so SPF/DKIM pass.
    'from' => 'website@jntsuppliers.com',
    // Cloudflare dashboard > Turnstile > add site (www.jntsuppliers.com) > secret key.
    'turnstile_secret' => 'REPLACE_WITH_SECRET_KEY',
    'allowed_hostnames' => ['www.jntsuppliers.com', 'jntsuppliers.com'],
    'allowed_origins' => ['https://www.jntsuppliers.com', 'https://jntsuppliers.com'],
    'data_dir' => __DIR__ . '/jnt-form-data',
    'max_per_hour' => 5,
    // For the staging copy at /new/, use '/new/contact/thanks/' and '/new/contact/'.
    'thanks_url' => '/contact/thanks/',
    'contact_url' => '/contact/',
    'dev_skip_turnstile' => false,
];
