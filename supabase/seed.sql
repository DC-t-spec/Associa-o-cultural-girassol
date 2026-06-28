insert into pages (slug,title,seo_title,seo_description,is_published) values ('home','Associação Cultural Girassol','Associação Cultural Girassol','Teatro, juventude, memória e transformação cultural em Moçambique.',true),('fiti','FITI – Festival Internacional Teatro de Inverno','FITI – Festival Internacional Teatro de Inverno','Festival internacional de teatro promovido pela Associação Cultural Girassol.',true) on conflict (slug) do update set title=excluded.title;
insert into page_sections (page_slug,section_key,section_name,section_type,order_index,is_active) values
('home','home_hero','Hero da homepage','hero',1,true),('home','home_about','Quem Somos','content',2,true),('home','home_mission_vision','Missão e Visão','content',3,true),('home','home_timeline','História','timeline',4,true),('home','home_what_we_do','O que fazemos','cards',5,true),('home','home_projects','Projectos','cards',6,true),('home','home_impact','Impacto','stats',7,true),('home','home_gallery','Galeria','gallery',8,true),('home','home_news','Notícias','news',9,true),('home','home_partners','Parceiros','partners',10,true),('home','home_contact','Contactos','contact',11,true),
('fiti','fiti_hero','Hero FITI','hero',1,true),('fiti','fiti_about','Sobre o FITI','content',2,true),('fiti','fiti_current_edition','Edição actual','content',3,true),('fiti','fiti_program','Programação FITI','program',4,true),('fiti','fiti_companies','Companhias FITI','cards',5,true),('fiti','fiti_workshops','Oficinas FITI','cards',6,true),('fiti','fiti_tickets','Bilhetes','content',7,true),('fiti','fiti_archive','Arquivo FITI','archive',8,true),('fiti','fiti_partners','Parceiros FITI','partners',9,true),('fiti','fiti_press','Imprensa','files',10,true),('fiti','fiti_contact','Contactos FITI','contact',11,true) on conflict (section_key) do update set section_name=excluded.section_name;
delete from theme_settings where key in ('stage_light_effect_enabled');
insert into theme_settings (key,value) values
('primary_color','#F7B500'),
('secondary_color','#111111'),
('accent_color','#F97316'),
('background_color','#050505'),
('text_color','#ffffff'),
('card_color','#18181b'),
('button_style','rounded'),
('dominant_yellow_enabled','true'),
('animated_background_enabled','true'),
('animated_logo_enabled','true'),
('animated_logo_url',''),
('animated_logo_opacity','0.08'),
('animated_logo_speed','42'),
('background_motion_intensity','medium'),
('background_type','mixed'),
('gradient_from','#F7B500'),
('gradient_to','#050505'),
('background_image_url',''),
('background_video_url',''),
('particles_enabled','true'),
('stage_lights_enabled','true'),
('overlay_opacity','0.55'),
('border_radius','1.5rem'),
('font_heading','Playfair Display'),
('font_body','Inter')
on conflict (key) do update set value=excluded.value;
insert into navigation_items (location,label,url,order_index,is_active) values ('main_menu','Início','#inicio',1,true),('main_menu','Quem Somos','#quem-somos',2,true),('main_menu','FITI','/fiti',10,true),('fiti_menu','Programação','/fiti#programacao',3,true),('footer_menu','Contacto','/#contacto',3,true) on conflict do nothing;
