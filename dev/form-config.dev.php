<?php
// Local development only. Uses Cloudflare's always-pass Turnstile test secret.
return [
    'site_name' => 'local preview',
    'to' => 'janaka808@gmail.com', // caught by Mailpit, never really sent
    'from' => 'website@jntsuppliers.com',
    'turnstile_secret' => '1x0000000000000000000000000000000AA',
    'allowed_hostnames' => [],
    'allowed_origins' => ['http://localhost:8091'],
    'data_dir' => '/tmp/jnt-form-data',
    'max_per_hour' => 5,
    'thanks_url' => '/contact/thanks/',
    'contact_url' => '/contact/',
    'dev_skip_turnstile' => false,
];
