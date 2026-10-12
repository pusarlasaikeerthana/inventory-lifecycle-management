USE inventory_lifecycle;
INSERT INTO dropdown_config(config_group,config_value,sort_order) VALUES
('assetType','Laptop',1),('assetType','Mobile',2),('assetType','Tablet',3),('assetType','SIM',4),('assetType','Monitor',5),
('make','Dell',1),('make','HP',2),('make','Lenovo',3),('make','Apple',4),('make','Samsung',5),
('location','Hyderabad',1),('location','Bengaluru',2),('location','Chennai',3),('location','Pune',4),('location','Remote',5),
('reason','New Joiner',1),('reason','Replacement',2),('reason','Project Allocation',3),('reason','Transfer',4),
('deviceCategory','Windows',1),('deviceCategory','Mac',2),('deviceCategory','Android',3),('deviceCategory','iOS',4),
('simManagedBy','Company',1),('simManagedBy','Employee',2),('simCountry','India',1),('simCountry','USA',2);