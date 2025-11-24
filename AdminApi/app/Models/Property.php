<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    // 1. Tell Laravel to use the table .NET created
    protected $table = 'Properties';

    protected $primaryKey = 'Id';

    public $timestamps = false;

    // 3. Allow these fields to be written
    protected $fillable = [
        'Title',
        'Price',
        'Bedrooms',
        'Address',
        'ImageUrl',
        'ListedAt'
    ];
}