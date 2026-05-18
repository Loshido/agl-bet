CREATE OR REPLACE FUNCTION notify_on_users_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('utilisateurs-update', json_build_object('operation', 'INSERT', 'data', to_jsonb(NEW))::text);
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('utilisateurs-update', json_build_object('operation', 'UPDATE', 'old', to_jsonb(OLD), 'new', to_jsonb(NEW))::text);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('utilisateurs-update', json_build_object('operation', 'DELETE', 'data', to_jsonb(OLD))::text);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER live_users
AFTER INSERT OR UPDATE OR DELETE ON utilisateurs
FOR EACH ROW EXECUTE FUNCTION notify_on_users_update();