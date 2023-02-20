export default function getRootRoute() {
  return location.pathname.substring(1).split('/').shift();
}
